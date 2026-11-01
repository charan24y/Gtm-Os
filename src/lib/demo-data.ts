export interface Prospect {
  id: string;
  name: string;
  role_or_handle: string;
  company_or_channel: string;
  mode: "individual" | "company";
  relevance_score: number;
  why_identified: string;
  evidence_quote_or_observation: string;
  evidence_url: string;
  timestamp: string;
  contact_email?: string;
  contact_link?: string;
  scores: {
    problem_match: number;
    intent: number;
    recency: number;
    icp_fit: number;
  };
}

export interface ProductDna {
  productName: string;
  productUrl: string;
  recommendedMode: "individual" | "company";
  valueProp: string;
  icpSegments: string[];
  buyingSignals: string[];
  searchQueries: string[];
}

export const CLIPFORGE_DEMO: { productDna: ProductDna; prospects: Prospect[] } = {
  productDna: {
    productName: "ClipForge AI",
    productUrl: "https://clipforge.ai",
    recommendedMode: "individual",
    valueProp: "Automatically repurposes long-form video podcasts and YouTube episodes into viral, subtitle-ready 60-second shorts.",
    icpSegments: [
      "YouTube Podcasters (20k–200k subs)",
      "Solo Video Editors & Freelancers",
      "Tech Founders with Long-Form Keynotes",
      "Independent Content Creators"
    ],
    buyingSignals: [
      "Publishes 30+ min long-form videos weekly but has near-zero Shorts uploaded in past 60 days",
      "Publicly complaining on X/Reddit about editing turnaround times",
      "Hiring for part-time short-form video editors",
      "Asking for automated clipping or subtitle generation alternatives"
    ],
    searchQueries: [
      'site:youtube.com "podcast" "full episode" -shorts',
      'site:reddit.com/r/videography "spending too much time editing shorts"',
      'site:twitter.com "looking for someone to edit my youtube shorts"'
    ]
  },
  prospects: [
    {
      id: "cf-1",
      name: "Alex Morgan",
      role_or_handle: "@AlexMorganTech",
      company_or_channel: "The AI Breakdown Podcast",
      mode: "individual",
      relevance_score: 96,
      why_identified: "Publishes 3 hour-long episodes weekly with 45K subscribers. Uploaded zero Shorts in the last 45 days despite 80% audience retention on long-form.",
      evidence_quote_or_observation: "Channel audit: 38 full episodes uploaded in Q3/Q4. Shorts shelf has only 2 uploads from 9 months ago. Severe untapped short-form repurposing gap.",
      evidence_url: "https://youtube.com/@AlexMorganTech/videos",
      timestamp: "Today, 11:42 AM",
      contact_email: "alex@morganmedianetwork.com",
      contact_link: "https://twitter.com/AlexMorganTech",
      scores: { problem_match: 40, intent: 28, recency: 14, icp_fit: 14 }
    },
    {
      id: "cf-2",
      name: "Sarah Chen",
      role_or_handle: "Lead Video & Podcast Producer",
      company_or_channel: "Chen Creative Studio",
      mode: "individual",
      relevance_score: 93,
      why_identified: "Directly seeking automated clipping tools to handle a 6-client podcast editing backlog. Spending 60% of billable time on manual reel cutdowns.",
      evidence_quote_or_observation: "Public comment: 'I edit 6 weekly client podcasts and clipping 30s reels is eating 60% of my billable time. Need a reliable AI tool that actually places good dynamic captions.'",
      evidence_url: "https://youtube.com/@ChenCreativeStudio",
      timestamp: "Yesterday, 3:15 PM",
      contact_email: "sarah@chencreativestudio.com",
      contact_link: "https://chencreativestudio.com",
      scores: { problem_match: 38, intent: 30, recency: 12, icp_fit: 13 }
    },
    {
      id: "cf-3",
      name: "Daniel Reed",
      role_or_handle: "@DanielReedCut",
      company_or_channel: "Reed Media Production",
      mode: "individual",
      relevance_score: 88,
      why_identified: "Actively advertising podcast repurposing services with manual turnaround bottleneck.",
      evidence_quote_or_observation: "Public portfolio states: 'Current turnaround 5 business days per 3 clips.' High operational fit for automated batch rendering.",
      evidence_url: "https://danielreedmedia.com/services",
      timestamp: "Today, 09:18 AM",
      contact_email: "daniel@danielreedmedia.com",
      contact_link: "https://linkedin.com/in/danielreedcut",
      scores: { problem_match: 36, intent: 25, recency: 13, icp_fit: 14 }
    },
    {
      id: "cf-4",
      name: "Marcus Vance",
      role_or_handle: "@VanceStartupDiary",
      company_or_channel: "The Solo Founder Journal",
      mode: "individual",
      relevance_score: 84,
      why_identified: "Solo founder recording daily video journals with zero bandwidth for TikTok/Shorts distribution.",
      evidence_quote_or_observation: "Latest tweet: 'I have 60 hours of unedited founder devlogs sitting on my SSD. Wish someone would turn these into TikTok clips automatically.'",
      evidence_url: "https://x.com/VanceStartupDiary/status/1849102830",
      timestamp: "Today, 08:30 AM",
      contact_email: "marcus@vancelabs.io",
      contact_link: "https://x.com/VanceStartupDiary",
      scores: { problem_match: 35, intent: 26, recency: 11, icp_fit: 12 }
    }
  ]
};

export const PROCURIFY_DEMO: { productDna: ProductDna; prospects: Prospect[] } = {
  productDna: {
    productName: "Procurify AI",
    productUrl: "https://procurify.com",
    recommendedMode: "company",
    valueProp: "Autonomous supplier intelligence platform that standardizes RFQs, audits supplier certifications, and uncovers unlisted catalog pricing.",
    icpSegments: [
      "Mid-Market Precision Manufacturers ($10M–$100M revenue)",
      "Tier-2 Industrial Automation OEMs",
      "Electronics Assembly Facilities",
      "Defense & Aerospace Component Subcontractors"
    ],
    buyingSignals: [
      "Active job postings for Procurement Specialists or Strategic Sourcing Managers",
      "Supply chain delay disclaimers published on customer-facing documentation",
      "Expansion into custom CNC or electronics assembly lines"
    ],
    searchQueries: [
      'site:linkedin.com/jobs "Procurement Manager" "manufacturing" "BOM"',
      'site:indeed.com/jobs "Strategic Sourcing" "lead time" "supplier"',
      'site:thomasnet.com "custom machining" "supplier inquiry"'
    ]
  },
  prospects: [
    {
      id: "proc-1",
      name: "Apex Precision Dynamics",
      role_or_handle: "VP of Supply Chain // David K.",
      company_or_channel: "Apex Precision Works",
      mode: "company",
      relevance_score: 95,
      why_identified: "Operating 3 assembly lines with public disclosure of component lead-time volatility and active hiring for 2 procurement expediters.",
      evidence_quote_or_observation: "Careers portal lists 2 open reqs: 'Sr. Procurement Specialist - Castings & Motors'. Corporate quarterly update notes 18-day average sourcing delay.",
      evidence_url: "https://apexprecision.com/careers/supply-chain",
      timestamp: "Today, 10:14 AM",
      contact_email: "dkowalski@apexprecision.com",
      contact_link: "https://linkedin.com/company/apex-precision-works",
      scores: { problem_match: 39, intent: 28, recency: 14, icp_fit: 14 }
    },
    {
      id: "proc-2",
      name: "Horizon Automation Systems",
      role_or_handle: "Director of Global Sourcing",
      company_or_channel: "Horizon Robotics & Systems",
      mode: "company",
      relevance_score: 91,
      why_identified: "Published supplier code of conduct with strict ISO 9001 and RoHS traceability requirements matching automated audit pipeline.",
      evidence_quote_or_observation: "Vendor onboarding page states: 'All tier-1/2 electrical components require manual certificate validation prior to PO release.'",
      evidence_url: "https://horizonrobotics.com/suppliers/requirements",
      timestamp: "Yesterday, 4:50 PM",
      contact_email: "vendor-ops@horizonrobotics.com",
      contact_link: "https://horizonrobotics.com/contact",
      scores: { problem_match: 38, intent: 26, recency: 13, icp_fit: 14 }
    },
    {
      id: "proc-3",
      name: "MedVance Medical Devices",
      role_or_handle: "Procurement Lead // Priya M.",
      company_or_channel: "MedVance Technologies",
      mode: "company",
      relevance_score: 87,
      why_identified: "Medical equipment builder undergoing line expansion with high tolerance and certified vendor requirements.",
      evidence_quote_or_observation: "Press release: 'Expanding Cleanroom Assembly Facility by 40,000 sq ft; active supplier qualification underway for custom stepper drives.'",
      evidence_url: "https://medvancetech.com/news/expansion-announcement",
      timestamp: "Today, 07:11 AM",
      contact_email: "sourcing@medvancetech.com",
      contact_link: "https://linkedin.com/company/medvance-tech",
      scores: { problem_match: 35, intent: 25, recency: 14, icp_fit: 13 }
    }
  ]
};
