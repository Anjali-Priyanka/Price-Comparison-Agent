📊 AI Price Comparison Agent

An AI-powered web application that compares product prices across multiple online stores using Google Shopping data via SerpAPI.
The system finds the best deal by analyzing prices, ratings, delivery details, and store information.

🚀 Features

✔ Search products across multiple online stores
✔ Real-time price comparison
✔ Store ratings and delivery details
✔ Best deal highlighting
✔ Clean and responsive UI
✔ No scraping required (uses Google Shopping API)

🛠 Tech Stack
Backend

Python

FastAPI

Frontend

HTML

CSS

JavaScript

API Integration

SerpAPI (Google Shopping data)

🏗 Project Architecture
User Search
     │
Frontend (HTML + JS)
     │
FastAPI Backend
     │
SerpAPI Google Shopping
     │
Product Results
     │
Price Comparison Table
📂 Project Structure
price-comparison-agent
│
├── main.py
├── price_agent.py
├── requirements.txt
│
├── static
│   ├── style.css
│   └── script.js
│
├── templates
│   └── index.html
│
└── README.md
⚙️ Installation
1️⃣ Clone Repository
git clone https://github.com/YOUR_USERNAME/ai-price-comparison-agent.git
2️⃣ Navigate to Project
cd ai-price-comparison-agent
3️⃣ Install Dependencies
pip install -r requirements.txt
🔑 Configure API Key

Create an environment variable for SERPAPI_KEY.

Example:

SERPAPI_KEY=your_api_key_here

Get your free API key from:

https://serpapi.com

▶️ Run the Application

Start the server:

python main.py

Server will run at:

http://localhost:8000
📡 API Endpoint
Compare Prices
POST /api/serpapi/compare

Example request:

{
  "query": "iPhone 15"
}

Example response:

{
  "results": [
    {
      "title": "Apple iPhone 15",
      "price": "74999",
      "store": "Amazon",
      "rating": "4.6",
      "link": "https://example.com"
    }
  ]
}
📸 Application Preview

Search a product to compare prices across multiple stores.

Example:

Search: iPhone 15

The application will show:

Product	Store	Price	Rating	Buy
iPhone 15	Amazon	₹74,999	⭐4.6	Buy
iPhone 15	Flipkart	₹73,999	⭐4.5	Buy

Best deal is highlighted automatically.

🌍 Live Demo

Deployed using Replit.

https://price-comparison-agent--priyankavechala.replit.app/

Example:

https://price-agent.username.replit.app
🎯 Future Enhancements

Price history tracking

AI recommendation engine

Deal alerts and notifications

Multi-product comparison

Browser extension

👩‍💻 Author

Anjali Priyanka
