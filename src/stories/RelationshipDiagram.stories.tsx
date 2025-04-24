import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { useState } from "react";
import {
  RelationshipDiagram,
  RelationshipDiagramProps,
} from "../RelationshipDiagram.js";
import { schemeCategory10, schemeTableau10 } from "d3-scale-chromatic";
import "../../dist/style.css";

const meta = {
  title: "RelationshipDiagram",
  component: RelationshipDiagram,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div
        style={{
          width: 1000,
          height: 500,
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RelationshipDiagram>;

const tableColors = [...schemeCategory10, ...schemeTableau10];

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    tableColors,
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
                type: "text",
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
                type: "text",
                foreignKeys: [],
              },
              {
                name: "email",
                type: "text",
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
                type: "text",
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
                type: "text",
                foreignKeys: [],
              },
              {
                name: "last_verified",
                type: "datetime",
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
                type: "text",
                foreignKeys: [],
              },
              {
                name: "name",
                type: "text",
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
                type: "text",
                foreignKeys: [],
              },
              {
                name: "name",
                type: "text",
                foreignKeys: [],
              },
              {
                name: "description",
                type: "text",
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
                type: "text",
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
                type: "text",
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
                type: "text",
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
                type: "datetime",
                foreignKeys: [],
              },
              {
                name: "end_date",
                type: "datetime",
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
  },
};
