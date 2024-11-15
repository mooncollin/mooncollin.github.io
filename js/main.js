class Article {
    constructor(title, description, link, tags = new Set(), date = null, photo = null) {
        this.title = title
        this.description = description
        this.link = link
        this.tags = tags
        this.date = date
        this.photo = photo
    }
}

class Tool {
    constructor(title, description, link, tags = new Set(), date = null, photo = null) {
        this.title = title
        this.description = description
        this.link = link
        this.tags = tags
        this.date = date
        this.photo = photo
    }
}

function generate_card(obj) {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card");

    if (obj.photo != null) {
        const img = document.createElement("img");
        img.classList.add("card-img-top", "p-2");
        img.src = obj.photo;
        cardDiv.appendChild(img);
    }

    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");
    cardDiv.appendChild(cardBody);

    const cardTitle = document.createElement("h5");
    cardTitle.classList.add("card-title");
    cardTitle.innerText = obj.title;
    cardBody.appendChild(cardTitle);

    const cardDescription = document.createElement("p");
    cardDescription.classList.add("card-text");
    cardDescription.innerText = obj.description;
    cardBody.appendChild(cardDescription);

    const cardLink = document.createElement("a");
    cardLink.classList.add("btn", "btn-primary");
    cardLink.href = obj.link;
    if (obj instanceof Article) {
        cardLink.innerText = "Read More";
    }
    else if (obj instanceof Tool) {
        cardLink.innerText = "Open Tool";
    }
    cardBody.appendChild(cardLink);

    if (obj.date != null) {
        const cardDate = document.createElement("p");
        cardDate.classList.add("mt-2", "mb-0");
        cardDate.innerText = obj.date.toLocaleString('default', {month: 'long', year: 'numeric', day: 'numeric'});
        cardBody.appendChild(cardDate);
    }

    return cardDiv
}

const articles = [
    new Article(
        "Social Security Versus Private Security",
        "A cost-benefit analysis of the public Social Security option versus private options.",
        "ss_versus_private.html",
        new Set(["Government", "Finance"]),
        new Date(2023, 9, 29),
        "images/ss.png"
    ),
    new Article(
        "The (Lack Of) Power of Retirement Accounts",
        "A look into how accounts like the 401K is a not as great a deal than otherwise expected",
        "the_power_of_retirement_accounts.html",
        new Set(["Finance"]),
        new Date(2024, 3, 1)
    ),
    new Article(
        "Asking An AI: Money Market Funds",
        "A series of discussions with ChatGPT on Money Market Funds",
        "ai_mmf.html",
        new Set(["Finance"]),
        new Date(2024, 10, 8),
        "images/openai-logomark.png"
    )
];

const tools = [
    new Tool(
        "Expense Tracker",
        "Track your expenses and income month-by-month with this handy Google Sheets dashboard.",
        "expense_tracker.html",
        new Set(["Finance"])
    ),
    new Tool(
        "Compound Interest Calculator",
        "Calculate compound interest over time with a contribution and withdraw strategy.",
        "compound_interest_calculator.html",
        new Set(["Finance"])
    ),
    new Tool(
        "Investment Calculator",
        "Simulate investment withdraw strategies using different investment accounts, tax rates, and Social Security.",
        "investment_calculator.html",
        new Set(["Finance"])
    )
]