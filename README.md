# React ERD

An easy-to-use component for rendering Entity Relationship Diagrams in React

![Example image](/example.png)

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

React ERD is compatible with React v18+.

## Usage

```js
import { RelationshipDiagram } from 'react-erd';
import 'react-erd/dist/style.css'

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
              color: "yellow",  // Optional. Use this specific color rather than those defined in tableColors
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

## Caveats

Note that the diagrams produced by this library are not Entity Relationship Diagrams in the strictest sense.

Traditionally, associative/junction tables used in many-to-many relationships are not represented as their own entity in an ERD. Instead the entities on each side of the relationship are joined by a single line, annotated with the appropriate "crow foot" notation to represent the many-to-many relation type.

React ERD was designed for use-cases where you want to provide users with a more 1:1 insight into the actual _tables_ in their database, rather than the _entities_ represented in your application.

In future React ERD may support more traditional forms of ERDs (see [roadmap](#roadmap) below).

## Roadmap

- Provide a controls overlay for navigating the diagram as an alternative to mouse/touch gestures.
- Improve control over diagram styles - potentially move towards a "headless" model.
- Support rendering many-to-many relationships in the traditional way using crow-foot notation and hidden junction table (see [caveats](#caveats)).
- Allow configuration of table positions on screen.
