export default function defaultMetafieldSetup(ownerId) {
    let tokens = [
        { token: " shopName " },
        { token: " shopDomain " },
        { token: " shopLogo " },
        { token: "name" },
        { token: "email" },
        { token: "message" }
      ];

    let metafieldArray = [
        {
            key: "admin-form-token",
            namespace: "quotes-app",
            ownerId: ownerId,
            type: "single_line_text_field",
            value: JSON.stringify(tokens)
        }
    ];
    return metafieldArray
};