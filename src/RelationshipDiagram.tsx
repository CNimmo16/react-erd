import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Connection,
  Edge,
  Node,
  NodeProps,
  EdgeProps,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import ReactFlow, {
  Handle,
  Position,
  ConnectionLineType,
  getSmoothStepPath,
} from "reactflow";

import Icon from "@mdi/react";
import { mdiKeyLink, mdiKey, mdiLinkVariant } from "@mdi/js";

export type DataType =
  | "binary"
  | "number"
  | "boolean"
  | "text"
  | "datetime"
  | "hierarchical"
  | "geometric"
  | "money"
  | "other";

type ForeignKey = {
  foreignSchemaName: string;
  foreignTableName: string;
  foreignColumnName: string;
  constrained: boolean;
};

type DatabaseTableInfo = {
  name: string;
  primaryKey: string | string[];
  columns: {
    name: string;
    type: DataType;
    foreignKeys: ForeignKey[];
  }[];
};

export type DatabaseSchemaInfo = {
  name: string;
  tables: DatabaseTableInfo[];
};

const getRef = (schemaName: string, tableName: string, columnName?: string) =>
  [schemaName, tableName, columnName].filter((x) => x).join(".");

const getEdges = (schemas: DatabaseSchemaInfo[]): Edge[] =>
  schemas.flatMap((schema) => {
    return schema.tables.flatMap((table) =>
      table.columns.flatMap((column) => {
        return column.foreignKeys.map((foreignKey): Edge => {
          return {
            id: `${getRef(schema.name, table.name, column.name)}:${getRef(
              foreignKey.foreignSchemaName,
              foreignKey.foreignTableName,
              foreignKey.foreignColumnName
            )}`,
            source: getRef(schema.name, table.name),
            sourceHandle: column.name,
            target: getRef(
              foreignKey.foreignSchemaName,
              foreignKey.foreignTableName
            ),
            targetHandle: foreignKey.foreignColumnName,
            type: "betweenTables",
            deletable: !foreignKey.constrained,
          };
        });
      })
    );
  });

type TableWithSchemaName = DatabaseTableInfo & {
  schemaName: string;
};
type TableNodeData = {
  id: string;
  table: TableWithSchemaName;
  foreignKeysReferencingTable: ForeignKey[];
  color: string;
};
type TableNode = Node<TableNodeData>;

const X_MULTIPLIER = 350;
const Y_PADDING = 25;
const ROW_HEIGHT = 21;
const NODE_WIDTH = 250;

export type SpecifiedForeignKey = Omit<ForeignKey, "constrained"> & {
  localSchemaName: string;
  localTableName: string;
  localColumnName: string;
};

export type RelationshipDiagramProps = {
  schemas: DatabaseSchemaInfo[];
  onSchemasChange?: (newSchemas: DatabaseSchemaInfo[]) => void;
  tableColors: string[];
  onCreateForeignKey?: (foreignKey: SpecifiedForeignKey) => void;
  onDeleteForeignKey?: (foreignKey: SpecifiedForeignKey) => void;
  onAttemptToRecreateExistingRelationship?: (
    attemptedForeignKey: SpecifiedForeignKey
  ) => void;
  onAttemptToConnectColumnToItself?: (column: {
    schemaName: string;
    tableName: string;
    columnName: string;
  }) => void;
  onAttemptToDeleteConstrainedRelationship?: (
    foreignKey: SpecifiedForeignKey
  ) => void;
};

function RelationshipDiagram({
  schemas,
  onSchemasChange,
  tableColors,
  onCreateForeignKey,
  onDeleteForeignKey,
  onAttemptToRecreateExistingRelationship,
  onAttemptToConnectColumnToItself,
  onAttemptToDeleteConstrainedRelationship,
}: RelationshipDiagramProps) {
  const reactFlowInstance = useReactFlow();

  const schemasRef = useRef(schemas);
  useEffect(() => {
    schemasRef.current = schemas;
  }, [schemas]);

  const defaultEdges = useMemo(() => getEdges(schemas), [schemas]);

  const [isCreatingNewConnection, setIsCreatingNewConnection] = useState(false);

  const TableNodeComponent = useMemo(
    () =>
      function TableNodeComponent({
        data: { table, color },
      }: NodeProps<TableNodeData>) {
        return (
          <div style={{ width: NODE_WIDTH }}>
            <div className="title" style={{ borderTopColor: color }}>
              {table.name}
            </div>
            <ul>
              {table.columns.map((column) => (
                <li key={column.name}>
                  {(() => {
                    const foreignKey =
                      column.foreignKeys.filter((key) => key.constrained)
                        .length >= 1;
                    const isPrimary = table.primaryKey === column.name;
                    if (foreignKey && isPrimary) {
                      return <Icon path={mdiKeyLink} className="column-icon" />;
                    } else if (foreignKey) {
                      return (
                        <Icon path={mdiLinkVariant} className="column-icon" />
                      );
                    } else if (isPrimary) {
                      return <Icon path={mdiKey} className="column-icon" />;
                    } else {
                      return <div className="column-icon" />;
                    }
                  })()}
                  <div className="column-name">{column.name}</div>
                  <div className="column-type">{column.type}</div>
                </li>
              ))}
            </ul>
            {table.columns.map((column, index) => {
              const top = ROW_HEIGHT * 1.5 + index * ROW_HEIGHT + 5;
              return (
                <Fragment key={column.name}>
                  <Handle
                    id={column.name}
                    type="source"
                    position={Position.Left}
                    style={{
                      top,
                      transform: `translate(5px, -50%)`,
                      pointerEvents: isCreatingNewConnection ? "none" : "all",
                    }}
                  />
                  <Handle
                    id={column.name}
                    type="target"
                    position={Position.Right}
                    style={{
                      top,
                      transform: `translate(-4px, -50%)`,
                      pointerEvents: isCreatingNewConnection ? "all" : "none",
                    }}
                  />
                </Fragment>
              );
            })}
          </div>
        );
      },
    [isCreatingNewConnection]
  );

  const nodeTypes = useMemo(
    () => ({ table: TableNodeComponent }),
    [TableNodeComponent]
  );

  const BetweenTablesEdgeComponent = useMemo(
    () =>
      function BetweenTablesEdgeComponent(props: EdgeProps) {
        const { id, style = {} } = props;

        const [edgePath] = getSmoothStepPath(props);

        return (
          <>
            <path
              id={id}
              style={style}
              className="react-flow__edge-path"
              d={edgePath}
            />
            <line
              x1={props.sourceX - 9}
              x2={props.sourceX}
              y1={props.sourceY}
              y2={props.sourceY - 6}
              style={style}
              strokeLinecap="round"
            />
            <line
              x1={props.sourceX - 9}
              x2={props.sourceX}
              y1={props.sourceY}
              y2={props.sourceY + 6}
              style={style}
              strokeLinecap="round"
            />
            <line
              x1={props.targetX + 10}
              x2={props.targetX + 10}
              y1={props.targetY - 8}
              y2={props.targetY + 8}
              style={style}
              strokeLinecap="round"
            />
          </>
        );
      },
    []
  );

  const edgeTypes = useMemo(
    () => ({ betweenTables: BetweenTablesEdgeComponent }),
    [BetweenTablesEdgeComponent]
  );

  const defaultNodes = useMemo(() => {
    const nodes: TableNode[] = [];

    const allTables = schemas.flatMap((schema) =>
      schema.tables.map((table) => ({ ...table, schemaName: schema.name }))
    );

    const parentTables = allTables.filter((table) =>
      table.columns.every((column) => column.foreignKeys.length === 0)
    );

    let maxX = 0;
    function createNodesForTables(
      tables: TableWithSchemaName[],
      parentXPosition = 0,
      parentYBottom = 0
    ) {
      const xPosition = parentXPosition + X_MULTIPLIER;

      maxX = Math.max(xPosition, maxX);

      let prevTableMaxY = 0;
      for (const [index, table] of tables.entries()) {
        const id = getRef(table.schemaName, table.name);
        if (nodes.some((node) => node.data.id === id)) {
          continue;
        }
        nodes;
        const yPosition = Math.max(parentYBottom, prevTableMaxY);

        const foreignKeysReferencingTable = allTables.flatMap((table) =>
          table.columns.flatMap((column) =>
            column.foreignKeys.filter(
              (foreignKey) =>
                getRef(
                  foreignKey.foreignSchemaName,
                  foreignKey.foreignTableName
                ) === id
            )
          )
        );

        nodes.push({
          id: id,
          data: {
            id,
            table,
            foreignKeysReferencingTable,
            color: tableColors[nodes.length % tableColors.length],
          },
          position: {
            x: xPosition,
            y: yPosition,
          },
          sourcePosition: Position.Left,
          targetPosition: Position.Right,
          type: "table",
        });
        const nextTables = allTables.filter((table) =>
          table.columns.some((column) =>
            column.foreignKeys.some(
              (foreignKey) =>
                getRef(
                  foreignKey.foreignSchemaName,
                  foreignKey.foreignTableName
                ) === id
            )
          )
        );

        const maxYPositionOfChildren = createNodesForTables(
          nextTables,
          xPosition,
          yPosition
        );
        const nodeHeight = ROW_HEIGHT + table.columns.length * ROW_HEIGHT;
        if (index === tables.length - 1) {
          return yPosition + nodeHeight + Y_PADDING;
        } else {
          prevTableMaxY = Math.max(
            maxYPositionOfChildren ?? 0,
            yPosition + nodeHeight + Y_PADDING
          );
        }
      }
    }

    createNodesForTables(parentTables);

    return nodes;
  }, [schemas, tableColors]);

  const handleConnectionStart = useCallback(() => {
    setIsCreatingNewConnection(true);
  }, []);

  const handleConnectionEnd = useCallback(() => {
    setIsCreatingNewConnection(false);
  }, []);

  const handleAddConnectionBetweenNodes = useCallback(
    (connection: Connection) => {
      const [localSchemaName, localTableName] = connection.source!.split(".");
      if (
        defaultEdges.some(
          (edge) =>
            edge.id ===
            `${connection.source}.${connection.sourceHandle}:${connection.target}.${connection.targetHandle}`
        )
      ) {
        const [foreignSchemaName, foreignTableName] =
          connection.target!.split(".");
        onAttemptToRecreateExistingRelationship?.({
          localSchemaName,
          localTableName,
          localColumnName: connection.sourceHandle!,
          foreignSchemaName,
          foreignTableName,
          foreignColumnName: connection.targetHandle!,
        });
        return;
      }
      if (
        connection.target === connection.source &&
        connection.targetHandle === connection.sourceHandle
      ) {
        onAttemptToConnectColumnToItself?.({
          schemaName: localSchemaName,
          tableName: localTableName,
          columnName: connection.sourceHandle!,
        });
        return;
      }
      if (
        connection.target &&
        connection.targetHandle &&
        connection.source &&
        connection.sourceHandle
      ) {
        const [targetSchema, targetTable] = connection.target.split(".");
        const [sourceSchema, sourceTable] = connection.source.split(".");
        const newSchemas = schemasRef.current.map((schema) => ({
          ...schema,
          tables: schema.tables.map((table) => ({
            ...table,
            columns: table.columns.map((column) => {
              const ret = { ...column };
              if (
                connection.targetHandle &&
                sourceSchema === schema.name &&
                sourceTable === table.name &&
                connection.sourceHandle === column.name
              ) {
                ret.foreignKeys.push({
                  foreignSchemaName: targetSchema,
                  foreignTableName: targetTable,
                  foreignColumnName: connection.targetHandle,
                  constrained: false,
                });
              }
              return ret;
            }),
          })),
        }));
        onSchemasChange?.(newSchemas);
        onCreateForeignKey?.({
          localSchemaName: sourceSchema,
          localTableName: sourceTable,
          localColumnName: connection.sourceHandle,
          foreignSchemaName: targetSchema,
          foreignTableName: targetTable,
          foreignColumnName: connection.targetHandle,
        });
      }
    },
    [
      defaultEdges,
      onAttemptToRecreateExistingRelationship,
      onAttemptToConnectColumnToItself,
      onSchemasChange,
      onCreateForeignKey,
    ]
  );

  const newConnectionToCreateRef = useRef<Connection | null>(null);

  const handleEdgeUpdate = useCallback(
    (_: unknown, newConnection: Connection) => {
      newConnectionToCreateRef.current = newConnection;
    },
    []
  );

  const handleEdgeUpdateStart = useCallback(() => {
    newConnectionToCreateRef.current = null;
  }, []);

  const handleEdgeUpdateEnd = useCallback(
    (_: unknown, edgeToDelete: Edge) => {
      const onDeleteArg = (() => {
        const [sourceSchema, sourceTable] = edgeToDelete.source.split(".");
        const [targetSchema, targetTable] = edgeToDelete.target.split(".");
        return {
          localSchemaName: sourceSchema,
          localTableName: sourceTable,
          localColumnName: edgeToDelete.sourceHandle!,
          foreignSchemaName: targetSchema,
          foreignTableName: targetTable,
          foreignColumnName: edgeToDelete.targetHandle!,
        };
      })();
      if (!edgeToDelete.deletable) {
        onAttemptToDeleteConstrainedRelationship?.(onDeleteArg);
      }
      onDeleteForeignKey?.(onDeleteArg);
      if (newConnectionToCreateRef.current) {
        // this means the edge has been moved to a new handle - create a new foreign key
        const onCreateArg = (() => {
          const [sourceSchema, sourceTable] =
            newConnectionToCreateRef.current.source!.split(".");
          const [targetSchema, targetTable] =
            newConnectionToCreateRef.current.target!.split(".");
          return {
            localSchemaName: sourceSchema,
            localTableName: sourceTable,
            localColumnName: newConnectionToCreateRef.current.sourceHandle!,
            foreignSchemaName: targetSchema,
            foreignTableName: targetTable,
            foreignColumnName: newConnectionToCreateRef.current.targetHandle!,
          };
        })();
        onCreateForeignKey?.(onCreateArg);
      }
      const newSchemas = schemasRef.current.map((schema) => ({
        ...schema,
        tables: schema.tables.map((table) => ({
          ...table,
          columns: table.columns.map((column) => {
            const ret = { ...column };
            const matchesColumn = (edgeLike: Edge | Connection) =>
              edgeLike.source === getRef(schema.name, table.name) &&
              edgeLike.sourceHandle === column.name;
            if (matchesColumn(edgeToDelete)) {
              ret.foreignKeys = ret.foreignKeys.filter((foreignKey) => {
                const wasDeleted =
                  getRef(
                    foreignKey.foreignSchemaName,
                    foreignKey.foreignTableName
                  ) === edgeToDelete.target &&
                  foreignKey.foreignColumnName === edgeToDelete.targetHandle;
                return !wasDeleted;
              });
            }
            if (
              newConnectionToCreateRef.current &&
              matchesColumn(newConnectionToCreateRef.current)
            ) {
              const [targetSchema, targetTable] =
                newConnectionToCreateRef.current.target!.split(".");
              ret.foreignKeys = [
                ...ret.foreignKeys,
                {
                  foreignSchemaName: targetSchema,
                  foreignTableName: targetTable,
                  foreignColumnName:
                    newConnectionToCreateRef.current.targetHandle!,
                  constrained: false,
                },
              ];
            }
            return ret;
          }),
        })),
      }));
      onSchemasChange?.(newSchemas);
    },
    [
      onAttemptToDeleteConstrainedRelationship,
      onCreateForeignKey,
      onDeleteForeignKey,
      onSchemasChange,
    ]
  );

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const handleNodeMouseEnter = useCallback((_: unknown, node: Node) => {
    setHoveredNodeId(node.id);
  }, []);
  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNodeId(null);
  }, []);

  useEffect(() => {
    const checkIfShouldHighlightEdge = (edge: Edge) =>
      hoveredNodeId && [edge.source, edge.target].includes(hoveredNodeId);
    reactFlowInstance.setEdges(
      [...defaultEdges]
        .sort(
          (a, b) =>
            Number(checkIfShouldHighlightEdge(a)) -
            Number(checkIfShouldHighlightEdge(b))
        )
        .map((edge) => {
          const shouldHighlight =
            hoveredNodeId && checkIfShouldHighlightEdge(edge);
          return {
            ...edge,
            style: {
              ...edge.style,
              zIndex: 500,
              stroke: shouldHighlight
                ? (defaultNodes ?? []).find((node) => node.id === edge.target)
                    ?.data.color
                : "rgb(var(--react-erd__secondary-color))",
              strokeWidth: shouldHighlight ? 2 : 1,
              transition: "stroke 0.3s",
            },
          };
        })
    );
  }, [defaultEdges, hoveredNodeId, defaultNodes, reactFlowInstance]);

  const ids = useRef(new WeakMap());
  const currId = useRef(0);
  const getObjectId = useCallback((object: object) => {
    if (ids.current.has(object)) {
      return ids.current.get(object);
    } else {
      const id = String(currId.current);
      currId.current += 1;
      ids.current.set(object, id);
      return id;
    }
  }, []);

  if (!defaultNodes) {
    return <div>Loading</div>;
  }

  return (
    <>
      <div
        className="react-erd__container"
        style={
          { "--row-height": `${ROW_HEIGHT}px` } as {
            [x: string]: string;
          }
        }
      >
        <ReactFlow
          key={getObjectId(schemas)}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultNodes={defaultNodes}
          defaultEdges={defaultEdges}
          fitView
          connectionRadius={30}
          connectionLineType={ConnectionLineType.SmoothStep}
          onNodeMouseEnter={handleNodeMouseEnter}
          onNodeMouseLeave={handleNodeMouseLeave}
          onEdgeUpdate={handleEdgeUpdate}
          onEdgeUpdateStart={handleEdgeUpdateStart}
          onEdgeUpdateEnd={handleEdgeUpdateEnd}
          onConnectStart={handleConnectionStart}
          onConnectEnd={handleConnectionEnd}
          onConnect={handleAddConnectionBetweenNodes}
        />
      </div>
    </>
  );
}

function RelationshipDiagramWrapper(props: RelationshipDiagramProps) {
  return (
    <ReactFlowProvider>
      <RelationshipDiagram {...props} />
    </ReactFlowProvider>
  );
}

export { RelationshipDiagramWrapper as RelationshipDiagram };
