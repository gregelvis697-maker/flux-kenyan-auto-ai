import {
  Store, Shield, Brain, BarChart3, Wrench,
  ShieldCheck, Search, Clock, Eye, DollarSign, Users,
  Zap, Lock, Network, TrendingUp, MessageSquare, Star,
  FileCheck, Camera, CheckCircle, CreditCard, AlertTriangle,
  Package, Settings, Megaphone, UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ProductFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface ProductStep {
  title: string;
  description: string;
}

export interface ProductBenefit {
  title: string;
  description: string;
}

export interface ProductFAQItem {
  question: string;
  answer: string;
}

export interface ProductData {
  slug: string;
  hero: {
    title: string;
    titleAccent: string;
    subtitle: string;
    ctaPrimary: { label: string; href: string };
    ctaSecondary?: { label: string; href: string };
  };
  overview: {
    heading: string;
    content: string;
    stats: { label: string; value: string }[];
  };
  features: ProductFeature[];
  howItWorks: ProductStep[];
  benefits: ProductBenefit[];
  faq: ProductFAQItem[];
  finalCta: {
    heading: string;
    ctaPrimary: { label: string; href: string };
    ctaSecondary?: { label: string; href: string };
  };
}

export const marketplaceData: ProductData = {
  slug: "marketplace",
  hero: {
    title: "Kenya's Most Trusted",
    titleAccent: "Vehicle Marketplace",
    subtitle: "Browse thousands of verified vehicles from curated dealers. Every listing inspected, every dealer vetted, every transaction protected.",
    ctaPrimary: { label: "Browse Vehicles", href: "/marketplace" },
    ctaSecondary: { label: "Learn About Escrow", href: "/products/escrow" },
  },
  overview: {
    heading: "More Than Just Listings",
    content: "The Flux Marketplace isn't another classifieds site. We've built Kenya's first curated automotive marketplace where every dealer is verified, every vehicle is legitimate, and every buyer is protected. No scams, no fake listings, no hidden surprises.",
    stats: [
      { label: "Verified Dealers", value: "500+" },
      { label: "Quality Listings", value: "5,000+" },
      { label: "Buyer Satisfaction", value: "98%" },
    ],
  },
  features: [
    { icon: ShieldCheck, title: "Verified Dealers Only", description: "Every dealer undergoes rigorous verification. Business registration, KRA compliance, and track record review before joining our network." },
    { icon: Star, title: "Quality Listings", description: "No junk, no spam. Each vehicle listing includes detailed specifications, multiple photos, and honest condition reports." },
    { icon: Search, title: "Advanced Search & Filters", description: "Find exactly what you need. Filter by make, model, year, price, mileage, body type, fuel type, transmission, and more." },
    { icon: Clock, title: "Real-Time Availability", description: "See what's actually available. Listings updated in real-time. No more calling about cars that sold weeks ago." },
    { icon: Eye, title: "Transparent Pricing", description: "No hidden fees. What you see is what you pay. Plus, our AI shows you if the price is fair based on market data." },
    { icon: Shield, title: "Buyer Protection", description: "Every purchase can be protected with our escrow service. Your money is safe until you confirm the vehicle is as described." },
  ],
  howItWorks: [
    { title: "Search & Filter", description: "Use our advanced filters to narrow down exactly what you're looking for. Set your budget, preferred features, and location." },
    { title: "Compare & Shortlist", description: "Save your favorite listings. Compare specs, prices, and dealer ratings side-by-side." },
    { title: "Contact Dealer", description: "Reach out via WhatsApp, schedule a viewing, or ask questions directly through the platform." },
    { title: "Buy with Confidence", description: "Complete your purchase with optional escrow protection. Test drive, inspect, and only pay when you're satisfied." },
  ],
  benefits: [
    { title: "Save Time", description: "No more scrolling through hundreds of fake listings or calling dealers with sold-out inventory. Every listing on Flux is current and legitimate." },
    { title: "Save Money", description: "Our AI price checker shows you market rates. Know instantly if you're getting a fair deal or being overcharged." },
    { title: "Peace of Mind", description: "Verified dealers, quality listings, and optional escrow protection mean you can buy with complete confidence." },
  ],
  faq: [
    { question: "How do you verify dealers?", answer: "Every dealer must provide: business registration documents, KRA PIN certificate, physical yard location, and pass our background check. We also monitor reviews and performance to ensure continued quality." },
    { question: "Are all listings guaranteed to be accurate?", answer: "Dealers are required to provide accurate information and photos. If a vehicle is significantly different from its listing, you can report it and we'll investigate. For maximum protection, use our escrow service when purchasing." },
    { question: "Can I negotiate prices?", answer: "Yes! The listed price is the dealer's asking price. You can contact them directly via WhatsApp to negotiate. Our AI price checker will show you if there's room for negotiation based on market data." },
    { question: "How do I know if a price is fair?", answer: "Every listing includes our AI-powered price assessment showing if the vehicle is priced below, at, or above market value. This is based on real-time market data from thousands of similar vehicles." },
    { question: "What if the vehicle is sold before I can buy it?", answer: "Dealers update availability in real-time. If a vehicle shows as available, it's still for sale. We recommend contacting the dealer quickly for high-demand vehicles." },
    { question: "Can I test drive before buying?", answer: "Absolutely! We encourage all buyers to test drive and inspect vehicles before purchasing. Use our escrow service to ensure your payment is protected during this process." },
    { question: "Are there any hidden fees?", answer: "No. The marketplace is free to browse. If you choose to use our escrow protection service (highly recommended), there's a 1.5% transaction fee deducted from the dealer's payout — you pay exactly the listed price." },
    { question: "How do I report a fake or suspicious listing?", answer: "Click the 'Report Listing' button on any vehicle page. Our team investigates all reports within 24 hours and removes fraudulent listings immediately." },
  ],
  finalCta: {
    heading: "Ready to Find Your Perfect Vehicle?",
    ctaPrimary: { label: "Browse Marketplace", href: "/marketplace" },
    ctaSecondary: { label: "Learn About Escrow Protection", href: "/products/escrow" },
  },
};

export const escrowData: ProductData = {
  slug: "escrow",
  hero: {
    title: "Buy with",
    titleAccent: "Zero Risk",
    subtitle: "Your money stays safe until you confirm the vehicle is exactly as described. Kenya's first automotive escrow service built for complete buyer protection.",
    ctaPrimary: { label: "Learn How It Works", href: "#how-it-works" },
    ctaSecondary: { label: "Browse Protected Vehicles", href: "/marketplace" },
  },
  overview: {
    heading: "What is Escrow Protection?",
    content: "Escrow protection is like a safety deposit box for your car purchase. Instead of paying the dealer directly, your money is held securely by Flux until you've inspected the vehicle and confirmed it's exactly as described. If there's a problem, you get a full refund. If everything's perfect, the dealer gets paid. It's that simple.",
    stats: [
      { label: "Bank-Level Security", value: "🔒" },
      { label: "Buyer Protection", value: "100%" },
      { label: "Fast Payouts", value: "48hrs" },
    ],
  },
  features: [
    { icon: Lock, title: "Secure Payment Holding", description: "Your payment is held in our secure escrow account. The dealer can't touch it until you confirm delivery and satisfaction." },
    { icon: Clock, title: "48-Hour Inspection Period", description: "Take up to 48 hours to thoroughly inspect the vehicle, test drive it, and verify all documents before finalizing the purchase." },
    { icon: CheckCircle, title: "Full Refund Guarantee", description: "If the vehicle doesn't match the listing or has undisclosed issues, simply raise a dispute and get your full money back." },
    { icon: CreditCard, title: "Multiple Payment Options", description: "Pay via M-Pesa, bank transfer, or credit/debit card. We accept all major payment methods through our secure integration." },
    { icon: Eye, title: "Transparent Process", description: "Track your escrow status in real-time. Know exactly where your money is and what happens next at every step." },
    { icon: Users, title: "Admin Mediation", description: "If there's a disagreement between you and the dealer, our team steps in to fairly resolve disputes based on evidence from both sides." },
  ],
  howItWorks: [
    { title: "Initiate Escrow Purchase", description: "Found the perfect car? Click 'Buy with Escrow Protection' on the vehicle listing. Review the terms and agree to the 48-hour inspection period." },
    { title: "Make Secure Payment", description: "Pay the full vehicle price using M-Pesa, bank transfer, or card. Your money goes into a secure escrow account — NOT to the dealer." },
    { title: "Dealer Delivers Vehicle", description: "The dealer is notified that payment has been received. They deliver the vehicle to you and mark it as 'Delivered' in the system." },
    { title: "Inspect & Confirm (48 Hours)", description: "You have 48 hours to test drive, inspect condition, verify documents, and check everything matches the listing. Then confirm delivery or raise a dispute." },
    { title: "Funds Released", description: "Once you confirm (or 48 hours pass), the dealer receives their payment. If you disputed, our admin team investigates and resolves fairly." },
  ],
  benefits: [
    { title: "Eliminate Buyer Risk", description: "Never again worry about paying for a car that doesn't exist, doesn't match the photos, or has hidden problems. Your money is 100% protected until you're satisfied." },
    { title: "Build Dealer Trust", description: "Dealers love escrow too! It shows buyers they're legitimate and serious. Good dealers close more deals faster when buyers feel safe." },
    { title: "Peace of Mind", description: "Sleep easy knowing Kenya's leading automotive platform is protecting your largest purchase. Our escrow has zero fraud incidents since launch." },
  ],
  faq: [
    { question: "How much does escrow protection cost?", answer: "Escrow protection has a 1.5% transaction fee, but it's paid by the dealer (deducted from their payout). You pay exactly the listed price with no additional fees." },
    { question: "What happens if I don't confirm within 48 hours?", answer: "If you take no action within 48 hours, funds automatically release to the dealer. This protects dealers from buyers who might hold payments hostage. You'll receive reminder notifications at 24 hours, 12 hours, and 2 hours remaining." },
    { question: "Can I get a refund if I change my mind?", answer: "Escrow protects you from vehicles not matching their description, not from buyer's remorse. You can only dispute if the vehicle has undisclosed issues or doesn't match the listing." },
    { question: "What if the dealer refuses to deliver after I pay?", answer: "The dealer cannot access the escrow funds until delivery is confirmed. If they refuse to deliver, contact our support team immediately and you'll receive a full refund within 24 hours." },
    { question: "How do disputes work?", answer: "If you raise a dispute, funds are frozen and both you and the dealer submit evidence (photos, videos, descriptions). Our admin team reviews all evidence and makes a fair decision within 3-5 days." },
    { question: "Is my payment information safe?", answer: "Absolutely. All payments are processed through PCI-DSS compliant payment gateways. We never store your card details or M-Pesa PIN. Your payment information is bank-level secure." },
    { question: "Can I use escrow for any vehicle purchase?", answer: "Yes! Any vehicle listed on Flux Marketplace can be purchased with escrow protection. Just click 'Buy with Escrow Protection' instead of contacting the dealer directly." },
    { question: "What if I discover a major issue after the 48-hour window?", answer: "You have an extended dispute window of 7-14 days after auto-release for major hidden issues (e.g., undisclosed accident damage, fake title). However, the burden of proof is higher since funds may already be disbursed." },
  ],
  finalCta: {
    heading: "Ready to Buy with Complete Protection?",
    ctaPrimary: { label: "Browse Protected Vehicles", href: "/marketplace" },
    ctaSecondary: { label: "View AI Intelligence", href: "/products/ai-intelligence" },
  },
};

export const aiIntelligenceData: ProductData = {
  slug: "ai-intelligence",
  hero: {
    title: "Smarter Buying Through",
    titleAccent: "AI",
    subtitle: "Get instant price predictions, fraud detection, and expert vehicle advice powered by Kenya's most advanced automotive AI.",
    ctaPrimary: { label: "Try AI Price Checker", href: "/marketplace" },
    ctaSecondary: { label: "View Analytics", href: "/products/analytics" },
  },
  overview: {
    heading: "Your AI-Powered Buying Assistant",
    content: "Making smart car buying decisions requires information — lots of it. Our AI analyzes millions of data points from Kenya's automotive market to give you instant insights: Is this price fair? Is this dealer trustworthy? What should I watch out for? Get expert-level guidance on every purchase.",
    stats: [
      { label: "Transactions Analyzed", value: "50,000+" },
      { label: "Real-Time Price Analysis", value: "📊" },
      { label: "Fraud Pattern Detection", value: "🚨" },
    ],
  },
  features: [
    { icon: TrendingUp, title: "AI Price Predictor", description: "Instantly know if a vehicle is priced fairly. Our AI analyzes similar vehicles, market trends, and historical data to show you if you're getting a good deal." },
    { icon: MessageSquare, title: "Automotive Chatbot", description: "Ask anything about makes, models, common issues, maintenance costs, or parts availability. Get instant, Kenya-specific answers 24/7." },
    { icon: AlertTriangle, title: "Fraud Detection", description: "Our AI flags suspicious listings: odometer tampering, fake photos, too-good-to-be-true prices, and other red flags before you waste your time." },
    { icon: BarChart3, title: "Market Insights", description: "Understand market trends. See which vehicles hold value best, which are in high demand, and what's a smart investment vs. a money pit." },
    { icon: TrendingUp, title: "Demand Forecasting", description: "See which vehicles are hot vs. sitting on lots. High demand = better resale value. Low demand = more room to negotiate." },
    { icon: FileCheck, title: "Vehicle History Patterns", description: "Our AI cross-references VINs, license plates, and listing patterns to detect relisted vehicles, accident history, and ownership red flags." },
  ],
  howItWorks: [
    { title: "Browse Any Listing", description: "Every vehicle on Flux includes AI insights automatically. No extra work required — just browse normally." },
    { title: "See AI Price Assessment", description: "Each listing shows: Market Price Range, Price Position (Below/Fair/Above Market), Confidence Score, and comparable vehicles data." },
    { title: "Check Fraud Flags", description: "AI scans every listing for photo inconsistencies, suspiciously low prices, odometer rollback indicators, and dealer reputation issues." },
    { title: "Ask the AI Chatbot", description: "Not sure if a BMW 3 Series is reliable? Wondering about parts availability for a Subaru Outback? Just ask — our AI knows Kenya's automotive market inside out." },
    { title: "Make Informed Decisions", description: "Use AI insights to negotiate better, avoid lemons, and buy vehicles that hold their value." },
  ],
  benefits: [
    { title: "Never Overpay Again", description: "Our AI analyzes every comparable vehicle in Kenya to show you exactly what you should pay. Dealers can't fool you with inflated prices." },
    { title: "Avoid Scams & Lemons", description: "Fraud detection AI spots red flags humans miss. Skip the headaches and focus on legitimate, quality vehicles." },
    { title: "Expert Knowledge, Zero Experience Needed", description: "Don't know anything about cars? No problem. Our AI gives you expert-level insights even if it's your first purchase." },
  ],
  faq: [
    { question: "How accurate is the AI price predictor?", answer: "Our AI achieves 92% accuracy on price predictions within a ±10% margin. It's trained on real Kenya transactions, KRA import data, and current market listings. Prices are updated daily." },
    { question: "Can I trust the AI chatbot's advice?", answer: "The chatbot is trained specifically on Kenya's automotive market — makes/models common here, parts availability from local suppliers, common issues reported by Kenyan mechanics. Always verify critical information with a mechanic." },
    { question: "Does the AI work for imported vehicles?", answer: "Yes! Our AI understands Kenya's import market. It factors in shipping costs, KRA duty calculations, port clearance times, and typical importer markups when assessing imported vehicle prices." },
    { question: "What if the AI says a price is 'Above Market' but I still want the car?", answer: "The AI provides information, not restrictions. You're free to buy any vehicle at any price. But if our AI says it's overpriced, you have strong negotiating power to push for a discount." },
    { question: "How does fraud detection work?", answer: "Our AI analyzes patterns across millions of data points: photo metadata, price anomalies, listing language, dealer behavior, VIN history, and more. When multiple fraud indicators align, we flag the listing." },
    { question: "Can dealers manipulate the AI price assessment?", answer: "No. Price assessments are based on objective market data that dealers cannot access or modify. Even if a dealer lists an overpriced vehicle, our AI will flag it as 'Above Market'." },
    { question: "Is AI replacing human judgment?", answer: "Never. AI is a tool to inform your decision, not make it for you. Always test drive, inspect, and verify vehicles yourself. Use AI insights as one input among many." },
    { question: "Will the AI features cost extra?", answer: "No! All AI features (price prediction, fraud detection, chatbot) are free for all Flux users. We believe everyone deserves access to smart buying tools." },
  ],
  finalCta: {
    heading: "Experience AI-Powered Car Buying",
    ctaPrimary: { label: "Try AI Price Checker", href: "/marketplace" },
    ctaSecondary: { label: "View Analytics & Data", href: "/products/analytics" },
  },
};

export const analyticsData: ProductData = {
  slug: "analytics",
  hero: {
    title: "Data-Driven",
    titleAccent: "Decisions",
    subtitle: "Access Kenya's most comprehensive automotive market data. Real-time pricing, demand trends, and insights that give you the competitive edge.",
    ctaPrimary: { label: "View Market Insights", href: "/marketplace" },
    ctaSecondary: { label: "Explore Dealer Tools", href: "/products/dealer-tools" },
  },
  overview: {
    heading: "Know More Than Your Competition",
    content: "Whether you're a dealer optimizing inventory, a buyer researching the best deal, or an investor tracking the market, Flux Analytics gives you the data edge. We aggregate and analyze every vehicle transaction, listing, and market signal in Kenya to deliver insights no one else has.",
    stats: [
      { label: "Transactions Analyzed", value: "50,000+" },
      { label: "Real-Time Updates", value: "🔄" },
      { label: "Historical Trends", value: "7 Years" },
    ],
  },
  features: [
    { icon: TrendingUp, title: "Live Market Pricing", description: "See real-time market prices for any make/model. Know instantly what similar vehicles are selling for across Kenya." },
    { icon: BarChart3, title: "Demand Forecasting", description: "Predict which vehicles will be in high demand next month. Make smart inventory or purchase decisions based on AI-powered forecasts." },
    { icon: Clock, title: "Historical Trends", description: "Track how prices have changed over time. Understand depreciation curves, seasonal patterns, and long-term market shifts." },
    { icon: Star, title: "Dealer Performance Metrics", description: "See which dealers move inventory fastest, have best prices, and highest customer satisfaction. Data-driven dealer selection." },
    { icon: FileCheck, title: "Custom Reports", description: "Generate detailed reports on specific segments: luxury SUVs, fuel-efficient sedans, commercial vehicles, etc. Export data for your own analysis." },
    { icon: Zap, title: "Market Alerts", description: "Get notified when prices drop significantly, hot vehicles hit the market, or trends shift in your favor." },
  ],
  howItWorks: [
    { title: "Research Your Target Vehicle", description: "Search for any make/model and see current market prices, historical trends, and seasonal insights across Kenya." },
    { title: "Track Specific Listings", description: "Save and monitor listings you're interested in. Get alerts on price drops and availability changes." },
    { title: "Analyze Market Data", description: "Use our analytics dashboard to compare vehicles, dealers, and market segments with comprehensive data visualizations." },
    { title: "Negotiate from Strength", description: "Walk into any negotiation armed with real market data. Know exactly what you should pay before making an offer." },
  ],
  benefits: [
    { title: "Make Smarter Purchases", description: "Buyers: Know the exact right price to pay. Avoid overpaying by thousands of shillings simply because you didn't have the data." },
    { title: "Sell Faster, Price Better", description: "Dealers: Data-driven pricing means you sell faster at optimal margins. No more guessing or losing deals to better-priced competition." },
    { title: "Spot Opportunities Early", description: "Catch market shifts before everyone else. Buy vehicles before demand spikes, sell before prices crater." },
  ],
  faq: [
    { question: "Where does Flux get its market data?", answer: "Our data comes from: active Flux listings, completed transactions on our platform, KRA CRSP import data (July 2025 onwards), dealer inventory reports, and aggregated pricing from other public sources." },
    { question: "How often is data updated?", answer: "Pricing data updates in real-time as new listings go live or transactions complete. Trend analysis and forecasts refresh daily. Historical data is permanent and constantly growing." },
    { question: "Can I export the data?", answer: "Premium dealer subscribers can export custom reports in CSV/Excel format. Basic users can view data in-platform but not export (to protect data integrity)." },
    { question: "Is the data reliable for making big decisions?", answer: "Our data is sourced from real transactions and verified listings, making it highly reliable. However, always combine data insights with your own research, inspections, and judgment." },
    { question: "How does Flux Analytics compare to other sources?", answer: "Traditional sources (newspapers, word-of-mouth) are outdated and limited. Only Flux combines verified listings + transaction data + AI analysis into actionable insights." },
    { question: "Can I see analytics for specific dealers?", answer: "Yes! Every dealer profile includes performance metrics: average days to sell, pricing compared to market, customer ratings, and inventory turnover." },
    { question: "Do I need to pay for analytics access?", answer: "Basic analytics (price ranges, market trends) are free for all users. Advanced features (custom reports, exports, alerts, forecasting) are included in Premium dealer subscriptions." },
    { question: "Can I use Flux data for commercial purposes?", answer: "Data licensing is available for institutions, lenders, insurers, and analysts who need bulk market data. Contact our partnerships team for pricing and terms." },
  ],
  finalCta: {
    heading: "Start Making Data-Driven Decisions",
    ctaPrimary: { label: "View Market Data", href: "/marketplace" },
    ctaSecondary: { label: "Explore Dealer Tools", href: "/products/dealer-tools" },
  },
};

export const dealerToolsData: ProductData = {
  slug: "dealer-tools",
  hero: {
    title: "Grow Your Dealership with",
    titleAccent: "Premium Tools",
    subtitle: "AI-powered customer matching, advanced analytics, inventory management, and premium listing features. Everything you need to sell more cars, faster.",
    ctaPrimary: { label: "Start Free Trial", href: "/auth" },
    ctaSecondary: { label: "View Pricing", href: "#pricing" },
  },
  overview: {
    heading: "Built for Serious Dealers",
    content: "Managing a successful dealership requires more than just posting listings. Flux Dealer Tools give you professional-grade features to attract more buyers, close deals faster, and grow your business efficiently. From AI customer matching to automated inventory management, we handle the tech so you can focus on sales.",
    stats: [
      { label: "Faster Sales Cycles", value: "40%" },
      { label: "More Qualified Leads", value: "60%" },
      { label: "Dealer Satisfaction", value: "4.8/5" },
    ],
  },
  features: [
    { icon: Brain, title: "AI Customer Matching", description: "Our AI automatically matches your inventory to buyers searching for those exact vehicles. Get notified when hot prospects are viewing your listings." },
    { icon: Package, title: "Inventory Management", description: "Upload, edit, and manage all your listings from one dashboard. Bulk uploads, quick edits, auto-renewal, and real-time availability updates." },
    { icon: Star, title: "Premium Listings", description: "Your vehicles appear at the top of search results, get highlighted borders, and show 'Premium Dealer' badges. Maximum visibility." },
    { icon: BarChart3, title: "Advanced Analytics", description: "See which listings get most views, where your traffic comes from, conversion rates, and days-to-sell for every vehicle." },
    { icon: MessageSquare, title: "Customer Messaging", description: "Manage all buyer inquiries from one inbox. Auto-replies, canned responses, and inquiry tracking so you never lose a lead." },
    { icon: Megaphone, title: "Marketing Tools", description: "Create dealer promotions, limited-time offers, and featured vehicle campaigns. We'll promote your best deals across the platform." },
    { icon: Star, title: "Reputation Management", description: "Monitor your ratings and reviews in real-time. Respond to feedback, showcase testimonials, and build trust with every transaction." },
    { icon: UserPlus, title: "Multi-User Access", description: "Add your sales team, manager, and admin staff with role-based permissions. Everyone works from the same system." },
  ],
  howItWorks: [
    { title: "Subscribe & Get Verified", description: "Choose your plan (Standard or Premium), upload verification documents (business registration, KRA PIN), and get approved within 24 hours." },
    { title: "Upload Your Inventory", description: "Add vehicles one by one or bulk upload from spreadsheet. Our system guides you through specs, photos, pricing, and description best practices." },
    { title: "Start Selling", description: "Your listings go live instantly. Our AI starts matching you with buyers, analytics track performance, and you get leads delivered to your inbox." },
    { title: "Grow Continuously", description: "Update inventory in real-time, respond to buyer messages, track sales analytics, and watch your dealership grow. We handle the tech, you close the deals." },
  ],
  benefits: [
    { title: "Sell Faster", description: "AI matching connects you with ready-to-buy prospects instantly. Premium placement puts your vehicles in front of more eyeballs. Inventory turns over 40% faster." },
    { title: "More Qualified Leads", description: "No tire-kickers. Flux buyers are serious, often with financing already arranged and escrow protection enabled. They're ready to close." },
    { title: "Professional Image", description: "Verified dealer badge, premium listings, and professional tools make you stand out from backyard sellers. Buyers trust established Flux dealers." },
  ],
  faq: [
    { question: "How long does dealer verification take?", answer: "Typically 24-48 hours. Upload your business registration, KRA PIN certificate, and yard photos. Our team reviews and approves quickly." },
    { question: "Can I cancel anytime?", answer: "Yes. Subscriptions are month-to-month with no long-term contracts. Cancel anytime and you won't be charged for the following month." },
    { question: "What happens if I exceed my listing limit on Standard plan?", answer: "If you hit 15 listings on Standard, you can either upgrade to Premium (unlimited), or remove old listings to add new ones. We'll notify you before you hit the limit." },
    { question: "Do I pay the 1.5% escrow fee on every sale?", answer: "Only if the buyer chooses escrow protection. If they pay you directly (cash/M-Pesa outside Flux), there's no escrow fee. When escrow is used, the 1.5% fee is deducted from your payout." },
    { question: "Can I manage multiple yard locations?", answer: "Yes! Premium plan includes multi-user access. Add separate logins for each location or use a single account to manage all inventory centrally." },
    { question: "What if buyers contact me outside Flux?", answer: "That's totally fine! Flux listings include your contact info. Buyers can reach you however they prefer. You're only required to use Flux escrow if the buyer requests it." },
    { question: "How does AI customer matching work?", answer: "Our AI tracks buyer search patterns, saved vehicles, and budget signals. When a buyer is actively looking for a vehicle you have, you get a real-time notification." },
    { question: "Can I run promotions or discounts?", answer: "Yes! Premium dealers can create time-limited promotions, featured listings, and special offers. These get highlighted across the platform to drive more traffic." },
    { question: "What kind of support do dealers get?", answer: "Standard: Email support (24hr response). Premium: Priority WhatsApp + phone support (same-day response), dedicated account manager for high-volume dealers." },
    { question: "Is there a setup fee?", answer: "No setup fees. Just your monthly subscription. We offer 50% off first month for new dealers to help you get started." },
  ],
  finalCta: {
    heading: "Ready to Grow Your Dealership?",
    ctaPrimary: { label: "Start 50% Off Trial", href: "/auth" },
    ctaSecondary: { label: "Browse Marketplace", href: "/marketplace" },
  },
};

export const productMenuItems = [
  { icon: Store, title: "Marketplace", subtitle: "Curated dealer network & verified listings", href: "/products/marketplace" },
  { icon: Shield, title: "Escrow Protection", subtitle: "Secure transactions, zero risk", href: "/products/escrow" },
  { icon: Brain, title: "AI Intelligence", subtitle: "Smart pricing, chatbot, fraud detection", href: "/products/ai-intelligence" },
  { icon: BarChart3, title: "Analytics & Data", subtitle: "Market insights & pricing tools", href: "/products/analytics" },
  { icon: Wrench, title: "Dealer Tools", subtitle: "Inventory, matching, premium features", href: "/products/dealer-tools" },
];
