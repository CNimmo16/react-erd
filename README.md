# React ERD

An easy-to-use component for rendering Entity Relationship Diagrams in React

## Installation

Install `react-erd` using npm:

```
npm install --save react-erd
```

or yarn:

```
yarn add react-erd
```

## Compatibility

`react-erd` is compatible with React v16.8+ and supports ES modules only.

## Usage

```js
import { RelationshipDiagram } from 'react-erd';
import 'react-erd/style.css'

function MyComponent() {
  return (
    <RelationshipDiagram
      schemas={[
        {
          name: "order_data",
          tables: [
            {
              name: "orders",
              primaryKey: "id",
              columns: [
                {
                  name: "id",
                  type: "number",
                  foreignKeys: [],
                },
                {
                  name: "customer_id",
                  type: "number",
                  foreignKeys: [
                    {
                      foreignSchemaName: "customer_data",
                      foreignTableName: "customers",
                      foreignColumnName: "id",
                      constrained: true,
                    },
                  ],
                },
              ],
            }
          ]
        },
        ...
      ]}
      onSchemasChange={...}
      onCreateForeignKey={...}
      onDeleteForeignKey={...}
      onAttemptToRecreateExistingRelationship={...}
      onAttemptToConnectColumnToItself={...}
      onAttemptToDeleteConstrainedRelationship={...}
      tableColors={['red', 'blue', 'green']}
    />
  );
}
```
