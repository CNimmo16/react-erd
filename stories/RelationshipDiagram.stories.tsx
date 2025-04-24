import { useState } from "react";
import { Meta } from "@storybook/react";
import {
  RelationshipDiagram,
  RelationshipDiagramProps,
} from "../src/RelationshipDiagram.js";
import { schemeCategory10, schemeTableau10 } from "d3-scale-chromatic";
import "../dist/style.css";

export default {
  title: "RelationshipDiagram",
  component: RelationshipDiagram,
  parameters: {
    layout: "fullscreen",
    actions: { argTypesRegex: "^on.*" },
  },
} satisfies Meta<typeof RelationshipDiagram>;

const tableColors = [...schemeCategory10, ...schemeTableau10];

export const Example = (storyArgs: RelationshipDiagramProps) => {
  const [schemas, setSchemas] = useState(storyArgs.schemas);
  return (
    <div
      style={{
        width: 1000,
        height: 460,
      }}
    >
      <RelationshipDiagram
        {...storyArgs}
        schemas={schemas}
        onSchemasChange={setSchemas}
        tableColors={tableColors}
      />
    </div>
  );
};
Example.args = {
  schemas: [
    {
      name: "customer_data",
      tables: [
        {
          name: "audiences",
          primaryKey: "id",
          columns: [
            {
              name: "id",
              type: "number",
              foreignKeys: [],
            },
            {
              name: "name",
              type: "string",
              foreignKeys: [],
            },
          ],
        },
        {
          name: "customers",
          primaryKey: "id",
          columns: [
            {
              name: "id",
              type: "number",
              foreignKeys: [],
            },
            {
              name: "full_name",
              type: "string",
              foreignKeys: [],
            },
            {
              name: "email",
              type: "string",
              foreignKeys: [],
            },
          ],
        },
        {
          name: "customer_audiences",
          primaryKey: ["customer_id", "audience_id"],
          columns: [
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
            {
              name: "audience_id",
              type: "number",
              foreignKeys: [
                {
                  foreignSchemaName: "customer_data",
                  foreignTableName: "audiences",
                  foreignColumnName: "id",
                  constrained: true,
                },
              ],
            },
          ],
        },
        {
          name: "customer_addresses",
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
            {
              name: "is_primary",
              type: "boolean",
              foreignKeys: [],
            },
          ],
        },
        {
          name: "customer_payment_info",
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
                  constrained: false,
                },
              ],
            },
            {
              name: "type",
              type: "string",
              foreignKeys: [],
            },
            {
              name: "is_primary",
              type: "boolean",
              foreignKeys: [],
            },
          ],
        },
        {
          name: "payment_card_details",
          primaryKey: "id",
          columns: [
            {
              name: "id",
              type: "number",
              foreignKeys: [],
            },
            {
              name: "customer_payment_info_id",
              type: "number",
              foreignKeys: [
                {
                  foreignSchemaName: "customer_data",
                  foreignTableName: "customer_payment_info",
                  foreignColumnName: "id",
                  constrained: true,
                },
              ],
            },
            {
              name: "card_number",
              type: "number",
              foreignKeys: [],
            },
            {
              name: "cvc",
              type: "number",
              foreignKeys: [],
            },
            {
              name: "expiry",
              type: "number",
              foreignKeys: [],
            },
          ],
        },
        {
          name: "payment_info_status",
          primaryKey: "customer_payment_info_id",
          columns: [
            {
              name: "customer_payment_info_id",
              type: "number",
              foreignKeys: [
                {
                  foreignSchemaName: "customer_data",
                  foreignTableName: "customer_payment_info",
                  foreignColumnName: "id",
                  constrained: true,
                },
              ],
            },
            {
              name: "status",
              type: "string",
              foreignKeys: [],
            },
            {
              name: "last_verified",
              type: "date",
              foreignKeys: [],
            },
          ],
        },
        {
          name: "payment_info_fraud_detection",
          primaryKey: "customer_payment_info_id",
          columns: [
            {
              name: "customer_payment_info_id",
              type: "number",
              foreignKeys: [
                {
                  foreignSchemaName: "customer_data",
                  foreignTableName: "customer_payment_info",
                  foreignColumnName: "id",
                  constrained: true,
                },
              ],
            },
            {
              name: "is_suspected",
              type: "boolean",
              foreignKeys: [],
            },
          ],
        },
      ],
    },
    {
      name: "product_data",
      tables: [
        {
          name: "product_categories",
          primaryKey: "slug",
          columns: [
            {
              name: "slug",
              type: "string",
              foreignKeys: [],
            },
            {
              name: "name",
              type: "string",
              foreignKeys: [],
            },
          ],
        },
        {
          name: "products",
          primaryKey: "slug",
          columns: [
            {
              name: "slug",
              type: "string",
              foreignKeys: [],
            },
            {
              name: "name",
              type: "string",
              foreignKeys: [],
            },
            {
              name: "description",
              type: "string",
              foreignKeys: [],
            },
          ],
        },
        {
          name: "product_category_products",
          primaryKey: ["product_category_slug", "product_slug"],
          columns: [
            {
              name: "product_category_slug",
              type: "string",
              foreignKeys: [
                {
                  foreignSchemaName: "product_data",
                  foreignTableName: "product_categories",
                  foreignColumnName: "slug",
                  constrained: true,
                },
              ],
            },
            {
              name: "product_slug",
              type: "string",
              foreignKeys: [
                {
                  foreignSchemaName: "product_data",
                  foreignTableName: "products",
                  foreignColumnName: "slug",
                  constrained: true,
                },
              ],
            },
          ],
        },
      ],
    },
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
        },
        {
          name: "order_fulfilment",
          primaryKey: "id",
          columns: [
            {
              name: "id",
              type: "number",
              foreignKeys: [],
            },
            {
              name: "order_id",
              type: "number",
              foreignKeys: [
                {
                  foreignSchemaName: "order_data",
                  foreignTableName: "orders",
                  foreignColumnName: "id",
                  constrained: true,
                },
              ],
            },
            {
              name: "status",
              type: "string",
              foreignKeys: [],
            },
            {
              name: "status_at",
              type: "datetime",
              foreignKeys: [],
            },
          ],
        },
        {
          name: "order_payment",
          primaryKey: "order_id",
          columns: [
            {
              name: "order_id",
              type: "number",
              foreignKeys: [
                {
                  foreignSchemaName: "order_data",
                  foreignTableName: "orders",
                  foreignColumnName: "id",
                  constrained: true,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "promo_data",
      tables: [
        {
          name: "promotions",
          primaryKey: "id",
          columns: [
            {
              name: "id",
              type: "number",
              foreignKeys: [],
            },
            {
              name: "start_date",
              type: "date",
              foreignKeys: [],
            },
            {
              name: "end_date",
              type: "date",
              foreignKeys: [],
            },
            {
              name: "discount",
              type: "number",
              foreignKeys: [],
            },
          ],
        },
      ],
    },
  ],
};
