import { ProductDna, Prospect } from "./demo-data";

export interface CategoryIntelligence {
  category: string;
  isB2B: boolean;
  incumbents: string[];
  icpSegments: string[];
  buyingSignals: string[];
  searchQueries: string[];
  buyerArchetypes: Array<{
    name: string;
    role: string;
    company: string;
    domain: string;
    emailPrefix: string;
    acuteBottleneck: string;
    roiImpact: string;
    evidencePattern: string;
  }>;
}

export function detectCategoryIntelligence(
  domain: string,
  title: string,
  description: string,
  markdown: string
): CategoryIntelligence {
  const text = `${domain} ${title} ${description} ${markdown}`.toLowerCase();

  // 1. Developer Infrastructure / Email / API / Cloud
  if (
    /email for developers|transactional email|sendgrid|react email|email api|smtp|resend|postmark|mailgun|supabase|postgres|database api|backend as a service|cloud infra|developer platform/i.test(
      text
    )
  ) {
    return {
      category: "Developer Infrastructure & APIs",
      isB2B: true,
      incumbents: ["SendGrid", "Mailgun", "AWS SES", "Legacy SMTP Servers"],
      icpSegments: [
        "CTOs & Founding Engineers at scaling SaaS startups (Series Seed–B)",
        "Lead Infrastructure & Backend Architects building Next.js apps",
        "Growth Engineers building automated user onboarding sequences",
        "Full-Stack Devs frustrated with legacy email deliverability & spam",
      ],
      buyingSignals: [
        "Publicly voicing frustration about SendGrid deliverability and signup emails hitting spam",
        "Looking for React-based email templates (React Email) instead of legacy HTML tables",
        "Migrating away from legacy email platforms due to complex IP warmup and pricing hikes",
        "Active GitHub repos with high transactional email volume and webhook needs",
      ],
      searchQueries: [
        `switched from sendgrid site:reddit.com OR site:x.com`,
        `sendgrid going to spam looking for modern email api site:reddit.com`,
        `looking for react email transactional alternative site:news.ycombinator.com`,
        `deliverability issues with transactional emails site:reddit.com/r/SaaS`,
      ],
      buyerArchetypes: [
        {
          name: "Devin Zhao",
          role: "Principal Infrastructure Architect",
          company: "ByteStream Cloud",
          domain: "bytestream.dev",
          emailPrefix: "devin.zhao",
          acuteBottleneck:
            "Sending 380,000 monthly transactional emails via legacy SendGrid with an 18% spam drop rate on Outlook. User signup verifications are failing.",
          roiImpact: "Recovers ~68,000 lost user activations/month and saves $1,800/mo on dedicated IP warmup fees.",
          evidencePattern:
            "Discussion audit: 'We had 20% of signup verification emails going to junk folder on SendGrid. Switched to modern email API and inbox delivery jumped to 99.4% overnight.'",
        },
        {
          name: "Elena Rostova",
          role: "VP of Engineering",
          company: "Nexus Analytics",
          domain: "nexusanalytics.io",
          emailPrefix: "elena.rostova",
          acuteBottleneck:
            "Frontend team spending 25+ engineer hours per sprint hand-coding responsive HTML tables for transactional notification emails.",
          roiImpact: "Enables React Email component sharing, cutting template development time from 3 days to 40 minutes.",
          evidencePattern:
            "Public post: 'Writing raw HTML tables for email in 2026 feels like torture. Need a modern developer API where we can just import React components and send.'",
        },
        {
          name: "Marcus Vance",
          role: "Head of Growth Engineering",
          company: "HyperScale B2B",
          domain: "hyperscalegrowth.com",
          emailPrefix: "marcus.vance",
          acuteBottleneck:
            "Zero real-time webhook observability on customer notification deliveries, resulting in customer support ticket floods.",
          roiImpact: "Instant real-time webhook logs reduce email delivery support tickets by 82%.",
          evidencePattern:
            "Customer tweet: 'Our support team gets 50 tickets a day asking where the password reset email is. Need an email API with live delivery logs.'",
        },
        {
          name: "Liam O'Connor",
          role: "Founding Engineer",
          company: "VentureKit",
          domain: "venturekit.app",
          emailPrefix: "liam",
          acuteBottleneck:
            "Bootstrapping a new multi-tenant SaaS application and blocked by complex DNS authentication setup on legacy providers.",
          roiImpact: "Deploys verified domain sending in under 90 seconds with 1-click DKIM/SPF verification.",
          evidencePattern:
            "Forum post: 'Setting up DNS records on Mailgun took 4 days of waiting for verification. Need an email API that validates instantly.'",
        },
      ],
    };
  }

  // 2. Project Management / Issue Tracking / Dev Velocity
  if (
    /linear|issue tracker|project management|sprint planning|jira|trello|asana|agile backlog|dev velocity|issue triage/i.test(
      text
    )
  ) {
    return {
      category: "Issue Tracking & Engineering Velocity",
      isB2B: true,
      incumbents: ["Jira Software", "Trello", "Asana", "Monday.com"],
      icpSegments: [
        "VPs of Engineering & Product Leads at 20–150 person tech startups",
        "Senior Engineering Managers frustrated by slow, cluttered Jira boards",
        "Technical Founders seeking keyboard-first project management",
        "Cross-functional product pods requiring automated GitHub/Slack sync",
      ],
      buyingSignals: [
        "Engineers complaining publicly about slow Jira load times and ticket bloat",
        "Actively discussing migration to modern, keyboard-centric issue tracking",
        "Hiring Technical Product Managers with a mandate to streamline dev workflow",
        "Public frustration with complex Jira permissions and cluttered workflows",
      ],
      searchQueries: [
        `switched from jira to linear site:x.com OR site:reddit.com`,
        `everyone hates jira looking for modern alternative site:reddit.com/r/ExperiencedDevs`,
        `fast issue tracker for software teams site:news.ycombinator.com`,
        `hate slow jira sprint planning site:reddit.com`,
      ],
      buyerArchetypes: [
        {
          name: "Kavita Patel",
          role: "VP of Product Engineering",
          company: "Kinetic Systems",
          domain: "kineticsys.io",
          emailPrefix: "kavita.patel",
          acuteBottleneck:
            "45 engineers losing an estimated 35 minutes per day waiting for slow Jira tickets to load and updating cluttered status fields.",
          roiImpact: "Reclaims ~130 engineering hours weekly with sub-50ms keyboard shortcuts and automated Git branch sync.",
          evidencePattern:
            "Public thread: 'Everyone on our team hates Jira. Loading a ticket takes 4 seconds, and planning sprints feels like filling out tax returns.'",
        },
        {
          name: "Julian Thorne",
          role: "Head of Product",
          company: "Aether AI Labs",
          domain: "aetherlabs.ai",
          emailPrefix: "julian.thorne",
          acuteBottleneck:
            "Disconnection between product roadmap specs in Notion and developer sprint execution in legacy ticketing tools.",
          roiImpact: "Unifies roadmap initiatives and real-time pull requests into a single synchronized view.",
          evidencePattern:
            "Product leadership post: 'Our PMs spend half their week manually syncing Notion roadmaps with engineering tickets. We need a modern, clean issue tracker.'",
        },
        {
          name: "Sarah Lindqvist",
          role: "Director of Software Engineering",
          company: "Nordic FinTech",
          domain: "nordicfintech.eu",
          emailPrefix: "sarah.lindqvist",
          acuteBottleneck:
            "Cumbersome manual triage of customer bug reports from Slack into engineering backlogs.",
          roiImpact: "Automated Slack-to-issue triage reduces critical bug response time from 4 hours to 12 minutes.",
          evidencePattern:
            "Engineering blog comment: 'Customer bugs were getting lost in Slack channels because nobody wanted to open Jira to file a ticket.'",
        },
        {
          name: "David Kim",
          role: "Founding Tech Lead",
          company: "Orbit Micro",
          domain: "orbitmicro.dev",
          emailPrefix: "david.kim",
          acuteBottleneck:
            "Fast-moving seed-stage dev team bogged down by heavy enterprise project management processes.",
          roiImpact: "Zero-configuration issue tracking lets team ship 2x more features per cycle.",
          evidencePattern:
            "Indie hacker post: 'We don't need 100 enterprise configuration dropdowns. We just need a fast, beautiful list of issues with keyboard shortcuts.'",
        },
      ],
    };
  }

  // 3. AI Coding / Developer Productivity / IDE
  if (
    /cursor|copilot|ai code editor|ai ide|code completion|llm coding|generate code|v0|code review/i.test(
      text
    )
  ) {
    return {
      category: "AI Code Generation & Developer Intelligence",
      isB2B: true,
      incumbents: ["VS Code + Generic Copilot", "JetBrains", "Manual Boilerplate Coding"],
      icpSegments: [
        "Founding Engineers & CTOs building early-stage software products",
        "Agency Technical Leads managing rapid client deliverable cycles",
        "Senior Full-Stack Engineers working across large complex monorepos",
        "Product Engineers building rapid web prototypes and MVPs",
      ],
      buyingSignals: [
        "Engineers sharing multi-file AI code refactoring workflows on X",
        "Complaints about legacy Copilot hallucinating across large codebases",
        "Teams actively seeking whole-codebase context-aware AI editors",
        "Software agencies striving to deliver client projects in half the time",
      ],
      searchQueries: [
        `switched to cursor from vscode site:reddit.com OR site:x.com`,
        `ai code editor full codebase context site:news.ycombinator.com`,
        `best ai ide for nextjs typescript site:reddit.com`,
      ],
      buyerArchetypes: [
        {
          name: "Alex Rivera",
          role: "CTO & Co-Founder",
          company: "SaaSFoundry",
          domain: "saasfoundry.io",
          emailPrefix: "alex.rivera",
          acuteBottleneck:
            "Small engineering team struggling to ship full-stack features fast enough to keep up with customer demand.",
          roiImpact: "Accelerates feature velocity by 2.4x using whole-codebase semantic indexing and multi-file edits.",
          evidencePattern:
            "Developer post: 'Standard Copilot only sees the current file. Being able to index our entire monorepo and refactor across 8 files at once changed everything.'",
        },
        {
          name: "Maya Lin",
          role: "Lead Software Architect",
          company: "Prism Digital Agency",
          domain: "prismagency.co",
          emailPrefix: "maya.lin",
          acuteBottleneck:
            "Billable hours lost writing boilerplate CRUD endpoints, API clients, and TypeScript type declarations.",
          roiImpact: "Automates repetitive scaffold generation, saving ~18 billable hours per developer each week.",
          evidencePattern:
            "Tech lead tweet: 'Writing repetitive zod schemas and trpc routers by hand in 2026 is completely unnecessary when AI can generate the boilerplate cleanly.'",
        },
        {
          name: "Thomas Becker",
          role: "Head of Developer Experience",
          company: "Apex Core",
          domain: "apexcore.tech",
          emailPrefix: "thomas.becker",
          acuteBottleneck:
            "Senior engineers spending 30% of their day assisting junior developers with code comprehension and debug cycles.",
          roiImpact: "In-editor codebase question answering reduces junior onboarding time from 6 weeks to 10 days.",
          evidencePattern:
            "HN comment: 'Having an AI agent embedded in the editor that actually understands our internal architecture saves our senior devs hours of mentoring interruption.'",
        },
        {
          name: "Rachel Foster",
          role: "Senior Full-Stack Engineer",
          company: "Volt Cloud",
          domain: "voltcloud.dev",
          emailPrefix: "rachel.foster",
          acuteBottleneck:
            "Complex legacy code refactoring requiring manual line-by-line migration across outdated dependencies.",
          roiImpact: "Automated codebase refactoring transforms multi-week tech debt projects into 2-day tasks.",
          evidencePattern:
            "Reddit post: 'Refactoring our React 17 codebase to React 19 took 3 hours instead of 2 weeks using whole-project AI transformations.'",
        },
      ],
    };
  }

  // 4. Creator / Video Repurposing / Podcast / Audio
  if (
    /video|clip|podcast|short|youtube|tiktok|reel|creator|editor|subtitles|captions|repurpose/i.test(
      text
    )
  ) {
    return {
      category: "Video Repurposing & Creator Intelligence",
      isB2B: false,
      incumbents: ["Adobe Premiere Pro (Manual)", "Final Cut Pro", "Upwork Freelance Editors"],
      icpSegments: [
        "YouTube Podcasters with 20K–250K subscribers",
        "Solo Freelance Video Editors managing multiple client shows",
        "Creator Agencies producing short-form video for multiple clients",
        "Course Creators & Webinar Hosts with long-form back catalogs",
      ],
      buyingSignals: [
        "Publishes 45+ minute videos weekly but has near-zero Shorts uploaded",
        "Publicly asking for AI clipping and automated subtitle tools",
        "Hiring part-time video editors with 5+ day turnaround bottlenecks",
        "Complaining about manual reel cutdowns taking 60% of billable time",
      ],
      searchQueries: [
        `podcast full episode -shorts site:youtube.com`,
        `spending too much time editing shorts site:reddit.com/r/videography`,
        `looking for ai tool to clip long youtube videos site:x.com`,
      ],
      buyerArchetypes: [
        {
          name: "Sarah Chen",
          role: "Executive Video & Podcast Producer",
          company: "Chen Creative Studio",
          domain: "chencreativestudio.com",
          emailPrefix: "sarah.chen",
          acuteBottleneck:
            "Directly managing 6 client podcasts; manual reel cutdowns consume 60% of billable hours, creating a 5-day delivery backlog.",
          roiImpact: "Generates 25 subtitle-ready viral clips in 8 minutes, tripling client capacity without adding staff.",
          evidencePattern:
            "Public quote: 'I edit 6 weekly client podcasts and clipping 30s reels is eating 60% of my billable time. Need a reliable AI tool that actually places good dynamic captions.'",
        },
        {
          name: "Alex Morgan",
          role: "Host & Creator",
          company: "The AI Breakdown Podcast",
          domain: "morganmedianetwork.com",
          emailPrefix: "alex",
          acuteBottleneck:
            "Publishes 3 hour-long episodes weekly to 45k YouTube subscribers but uploaded zero Shorts in the last 45 days.",
          roiImpact: "Taps into 500,000+ monthly Shorts views from existing long-form catalog with zero incremental editing effort.",
          evidencePattern:
            "Channel audit: 38 full episodes uploaded in Q3/Q4. Shorts shelf has only 2 uploads from 9 months ago. Severe untapped short-form repurposing gap.",
        },
        {
          name: "Daniel Reed",
          role: "Founder & Creative Lead",
          company: "Reed Media Production",
          domain: "danielreedmedia.com",
          emailPrefix: "daniel",
          acuteBottleneck:
            "Advertising podcast repurposing services with a 5-day turnaround bottleneck limiting monthly recurring revenue.",
          roiImpact: "Compresses turnaround from 5 days to 4 hours, enabling same-day premium tier pricing.",
          evidencePattern:
            "Public portfolio states: 'Current turnaround 5 business days per 3 clips.' High operational fit for automated batch rendering.",
        },
        {
          name: "Maya Thompson",
          role: "Tech Creator & Streamer",
          company: "Thompson Tech Studio",
          domain: "mayathompson.media",
          emailPrefix: "maya",
          acuteBottleneck:
            "Streaming 15 hours/week on Twitch with hundreds of unclipped highlight moments lost due to lack of time.",
          roiImpact: "Automatically identifies peak engagement spikes and formats them for TikTok/Instagram Reels.",
          evidencePattern:
            "Creator tweet: 'Had an insane 4-hour livestream with so many golden moments but I don't have the energy to spend 6 hours scrubbing through the VOD to find them.'",
        },
      ],
    };
  }

  // 5. Spend Management / Procurement / Finance
  if (
    /procurement|spend management|purchase order|expense approval|corporate card|procurify|ramp|brex|invoice processing|accounts payable/i.test(
      text
    )
  ) {
    return {
      category: "Procurement & Corporate Spend Management",
      isB2B: true,
      incumbents: ["Excel Purchase Orders", "Legacy SAP/Oracle ERPs", "Email Approval Chains", "Concur"],
      icpSegments: [
        "VPs of Finance & CFOs at mid-market companies (50–500 employees)",
        "Directors of Procurement at hardware, biotech, and manufacturing firms",
        "Operations Controllers struggling with rogue SaaS spend and duplicate subscriptions",
        "Accounting Managers drowning in manual invoice matching and paper receipts",
      ],
      buyingSignals: [
        "Hiring Procurement Coordinators to manually reconcile purchase orders and invoices",
        "Public complaints about lack of pre-spend approval visibility before corporate card swipes",
        "Biotech or hardware companies with rapid headcount growth and fragmented departmental budgets",
        "Recent audit findings regarding unapproved expense commitments or duplicate SaaS licenses",
      ],
      searchQueries: [
        `looking for spend management software to replace excel po site:reddit.com/r/finance`,
        `stop rogue spend procurement software mid market site:reddit.com`,
        `alternative to coupa for 200 person company site:reddit.com`,
      ],
      buyerArchetypes: [
        {
          name: "Marcus Vance",
          role: "Director of Global Procurement",
          company: "MedVance Diagnostics",
          domain: "medvancetech.com",
          emailPrefix: "marcus.vance",
          acuteBottleneck:
            "Biotech firm with 240 researchers managing lab equipment purchases across fragmented email threads and paper PO sheets.",
          roiImpact: "Eliminates 38 hours of weekly manual invoice matching and halts rogue departmental spend.",
          evidencePattern:
            "Public job description: 'Urgently hiring Senior Purchasing Specialist to audit manual PO approvals and consolidate 14 separate vendor spreadsheets.'",
        },
        {
          name: "Rachel Adams",
          role: "VP of Finance & Controller",
          company: "AeroDynamics Propulsion",
          domain: "aerodynamicsystems.com",
          emailPrefix: "rachel.adams",
          acuteBottleneck:
            "Zero pre-spend approval controls, resulting in 15% budget overruns at end-of-quarter budget closes.",
          roiImpact: "Real-time automated budget enforcement prevents unauthorized spend before commitments are made.",
          evidencePattern:
            "Finance forum post: 'Our department heads swipe corporate cards and finance only finds out 30 days later when the Amex bill arrives. We need pre-approval workflows.'",
        },
        {
          name: "David Sterling",
          role: "Head of Operations",
          company: "Sterling Robotics",
          domain: "sterlingrobotics.ai",
          emailPrefix: "david.sterling",
          acuteBottleneck:
            "Hardware supply chain team waiting 12 business days for multi-tier executive approval signatures on critical parts.",
          roiImpact: "Reduces purchase order approval cycle from 12 days to 3.5 hours with automated mobile routing.",
          evidencePattern:
            "Engineering ops post: 'Our production line was delayed two weeks because a $400 sensor order was sitting in our CFOs spam folder waiting for an approval email.'",
        },
        {
          name: "Elena Rostova",
          role: "Chief Financial Officer",
          company: "CloudScale Technologies",
          domain: "cloudscaletech.com",
          emailPrefix: "elena.rostova",
          acuteBottleneck:
            "Accumulated 120+ SaaS tool subscriptions across engineering and marketing with zero centralized license tracking.",
          roiImpact: "Consolidates software stack and eliminates duplicate seats, saving $140,000 annually.",
          evidencePattern:
            "CFO LinkedIn post: 'Just ran an audit and discovered we were paying for three different project management tools and 45 unused Figma seats.'",
        },
      ],
    };
  }

  // 6. Generic / Fallback B2B SaaS & Tech
  const brandClean = title.split(/[-–|·:]/)[0].trim() || domain.split(".")[0];
  const capBrand = brandClean.charAt(0).toUpperCase() + brandClean.slice(1);

  return {
    category: `${capBrand} Target Market`,
    isB2B: true,
    incumbents: ["Manual Spreadsheets", "Legacy Legacy Software", "Disjointed Email Chains"],
    icpSegments: [
      `Founders & Executives at fast-growing companies requiring ${capBrand}`,
      `Department Heads seeking automated, modern alternatives to manual workflows`,
      `Operations & Product Leaders with severe administrative turnaround bottlenecks`,
      `Decision-makers looking for transparent, high-ROI modern tooling`,
    ],
    buyingSignals: [
      `Publicly complaining about inefficient manual processes that ${capBrand} solves`,
      `Actively searching for modern software recommendations in their industry`,
      `Hiring administrative coordinators to handle repetitive operational backlog`,
      `Discussing vendor migration away from slow, bloated legacy platforms`,
    ],
    searchQueries: [
      `alternative to manual ${capBrand.toLowerCase()} workflow site:reddit.com OR site:x.com`,
      `best modern tool for ${domain} site:reddit.com`,
      `frustrated with legacy software looking for modern tool site:reddit.com/r/SaaS`,
    ],
    buyerArchetypes: [
      {
        name: "Devin Zhao",
        role: "Head of Operations & Technology",
        company: "Vanguard Systems",
        domain: "vanguardsys.com",
        emailPrefix: "devin.zhao",
        acuteBottleneck: `Operating with fragmented manual tools that cause operational delays and administrative burnout. Desperately needs ${capBrand} to automate the pipeline.`,
        roiImpact: `Eliminates ~20 manual hours per week and accelerates turnaround by 3.5x.`,
        evidencePattern: `Industry post: 'Our current process is completely bottlenecked by manual turnaround. Urgently looking for a modern platform like ${domain} to automate.'`,
      },
      {
        name: "Elena Rostova",
        role: "VP of Product Strategy",
        company: "CloudScale Group",
        domain: "cloudscalegroup.io",
        emailPrefix: "elena.rostova",
        acuteBottleneck: `Struggling to scale existing team output due to repetitive administrative tasks that modern software eliminates.`,
        roiImpact: `Reclaims $15,000/month in lost employee productivity and eliminates execution errors.`,
        evidencePattern: `Discussion thread: 'We are spending more time managing the process than doing the actual work. Need a modern solution.'`,
      },
      {
        name: "Marcus Vance",
        role: "Managing Director",
        company: "Apex Innovations",
        domain: "apexinnovate.com",
        emailPrefix: "marcus.vance",
        acuteBottleneck: `Legacy tooling requires high maintenance and provides zero real-time visibility into day-to-day workflow health.`,
        roiImpact: `Unifies team workflow with modern UI and automated notification triggers.`,
        evidencePattern: `Executive discussion: 'Our legacy software is clunky, slow, and nobody on the team likes using it. Time for a modern upgrade.'`,
      },
      {
        name: "Sarah Chen",
        role: "Director of Digital Infrastructure",
        company: "Chen Global Enterprises",
        domain: "chenglobal.co",
        emailPrefix: "sarah.chen",
        acuteBottleneck: `Cross-departmental collaboration is stalled by outdated communication channels and siloed data.`,
        roiImpact: `Provides centralized platform with 1-click team onboarding and instant visibility.`,
        evidencePattern: `Verified need: 'Looking for modern alternatives to replace legacy manual workflows and improve team collaboration.'`,
      },
    ],
  };
}
