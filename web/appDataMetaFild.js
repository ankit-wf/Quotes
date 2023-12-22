export default async function createAppDataMetafields(data) {
    let query = {
      "query": `mutation CreateAppDataMetafield($metafields: [MetafieldsSetInput!]!) {
          metafieldsSet(metafields: $metafields) {
            metafields {
              id
              key
              namespace
              type
              value
            }
            userErrors {
              field
              message
              code
            }
          }
        }`,
      "variables": {
        "metafields":
        {
          "key": data.key,
          "namespace": data.namespace,
          "ownerId": data.ownerId,
          "type": data.type,
          "value": data.value
        }
      },
    }
  
    return await query
  };