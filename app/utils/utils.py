MCC_CATEGORIES = {
    # Grocery & supermarkets
    5411: "groceries",
    5422: "meat",
    5441: "candy",
    5451: "dairy",
    5462: "bakery",

    # Restaurants
    5812: "restaurants",
    5813: "bars",
    5814: "fast_food",

    # Shopping
    5311: "department_store",
    5651: "clothing",
    5999: "shopping_other",

    # Pharmacy
    5912: "pharmacy",

    # Transport
    4111: "transport",
    4121: "taxi",

    # Services / subscriptions
    4899: "subscription",
    4814: "telecom",

    # Transfers
    4829: "transfers",

    # Sport / health
    7941: "fitness",

    # Default
    0: "other"
}


def get_category_from_mcc(mcc: int):
    return MCC_CATEGORIES.get(mcc, "other").upper()


