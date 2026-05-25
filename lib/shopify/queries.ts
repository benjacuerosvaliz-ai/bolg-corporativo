/**
 * Queries GraphQL de la Storefront API.
 *
 * Los metafields se piden con alias para mapearlos directo al schema interno
 * de CorporateProduct sin tener que iterar el array genérico de metafields.
 */

const CORPORATE_METAFIELDS_FRAGMENT = /* GraphQL */ `
  fragment CorporateMetafields on Product {
    eligible: metafield(namespace: "corporate", key: "eligible") { value }
    minQty: metafield(namespace: "corporate", key: "min_qty") { value }
    leadTimeReorder: metafield(namespace: "corporate", key: "lead_time_days_reorder") { value }
    baseCostUsd: metafield(namespace: "corporate", key: "base_cost_usd") { value }
    volumePricing: metafield(namespace: "corporate", key: "volume_pricing") { value }
    printAreas: metafield(namespace: "corporate", key: "print_areas") { value }
    printTechniques: metafield(namespace: "corporate", key: "print_techniques") { value }
  }
`;

const PRODUCT_FIELDS_FRAGMENT = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    handle
    title
    vendor
    productType
    description
    descriptionHtml
    tags
    featuredImage {
      url
      altText
      width
      height
    }
    images(first: 8) {
      edges {
        node {
          url
          altText
          width
          height
        }
      }
    }
    variants(first: 50) {
      edges {
        node {
          id
          title
          sku
          availableForSale
          selectedOptions {
            name
            value
          }
          price {
            amount
            currencyCode
          }
          image {
            url
            altText
            width
            height
          }
        }
      }
    }
    ...CorporateMetafields
  }
  ${CORPORATE_METAFIELDS_FRAGMENT}
`;

export const LIST_CORPORATE_PRODUCTS = /* GraphQL */ `
  query ListCorporateProducts($first: Int!) {
    products(first: $first, query: "tag:CORPORATIVO") {
      edges {
        node {
          ...ProductFields
        }
      }
    }
  }
  ${PRODUCT_FIELDS_FRAGMENT}
`;

export const GET_CORPORATE_PRODUCT_BY_HANDLE = /* GraphQL */ `
  query GetCorporateProduct($handle: String!) {
    product(handle: $handle) {
      ...ProductFields
    }
  }
  ${PRODUCT_FIELDS_FRAGMENT}
`;
