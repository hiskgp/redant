# RedANT — WhatsApp CRM & Business Automation

> **RedANT** is a WhatsApp CRM and business automation platform designed to help businesses manage customer conversations, automate replies, organize leads, and streamline sales — all from one place.

**Website:** https://redant.in

---

## About RedANT

RedANT helps businesses simplify customer communication through WhatsApp automation, CRM tools, and AI-powered assistance.

Whether you run a boutique, cake shop, D2C brand, or e-commerce business, RedANT helps you manage customer enquiries, follow up with leads, and automate repetitive conversations.

**Our mission:** Help businesses save time, improve customer engagement, and grow through smarter communication.

## Features

### WhatsApp Business CRM

* Shared inbox for managing customer conversations.
* Assign conversations to team members.
* Track conversation status and add internal notes.
* Manage customer contacts, tags, and custom fields.
* Import contacts using CSV files.

### Sales & Lead Management

* Organize leads using Kanban-style sales pipelines.
* Track deals and sales opportunities.
* Link customer conversations with sales activities.
* Manage leads from enquiry to conversion.

### WhatsApp Broadcasts

* Send messages using approved WhatsApp templates.
* Personalize messages using recipient variables.
* Track message delivery and read status.
* Manage customer communication campaigns.

*WhatsApp messaging is subject to Meta's policies, template approval, and applicable messaging charges.*

### No-Code Automation

* Automate responses to incoming messages.
* Trigger workflows based on keywords and customer activity.
* Use conditional branches, delays, tags, and webhooks.
* Build workflows using a visual automation editor.

### AI-Powered Reply Assistant

* Generate AI-assisted customer replies.
* Support OpenAI and Anthropic integrations.
* Configure automated replies with human handoff.
* Create a knowledge base using FAQs, policies, and product documentation.
* Retrieve relevant information from your own business content.

AI functionality depends on the configured provider and API credentials. Provider usage charges may apply.

### Team Collaboration

* Invite team members to collaborate.
* Manage owner, admin, agent, and viewer roles.
* Assign conversations and manage team access.
* Support individual and team-based workflows.

### Analytics & Dashboard

* Monitor customer conversation activity.
* Track response times and message volume.
* View sales pipeline values.
* Review activity across CRM modules.

### Developer Integrations

* Public REST API with scoped API keys.
* MCP server integration for compatible AI assistants.
* Webhook support for external integrations.
* Extend the platform to fit your business workflows.

---

## Why Choose RedANT?

RedANT brings customer communication, lead management, and automation together in one platform.

* **Save time:** Automate repetitive customer enquiries.
* **Manage leads:** Keep customer conversations and sales opportunities organized.
* **Improve follow-ups:** Reduce the chance of missing customer enquiries.
* **Work as a team:** Allow multiple agents to manage customer conversations.
* **Support customers in Tamil and English:** Communicate with customers in their preferred language.
* **Scale your business:** Build workflows that support your growing customer base.

RedANT is designed to help businesses work smarter while keeping customer communication organized.

---

## RedANT Plans

| Plan       |  Price |
| ---------- | -----: |
| Standard   |   ₹999 |
| Stable     | ₹2,999 |
| E-commerce | ₹3,999 |

*Prices are indicative plan prices. Confirm billing frequency, included features, applicable taxes, Meta messaging charges, and any usage limits with RedANT before purchasing.*

For plan details and enquiries, visit [redant.in](https://redant.in).

---

## Technology Stack

* **Frontend:** Next.js, React, TypeScript, Tailwind CSS
* **Backend:** Next.js and Node.js
* **Database & Authentication:** Supabase (PostgreSQL, Auth, Storage, and Row-Level Security)
* **Messaging:** Official WhatsApp Business Platform / Meta Cloud API
* **AI integrations:** OpenAI and Anthropic, when configured
* **Deployment:** Vercel or another compatible Node.js hosting environment, subject to application requirements

---

## Getting Started

### Prerequisites

Before running the application locally, make sure you have:

* Node.js and npm installed.
* A Git client.
* A Supabase project.
* The required Meta WhatsApp Business Platform credentials.
* The necessary environment variables.

### Installation

```bash
# Clone your RedANT repository
git clone <YOUR_REDANT_GITHUB_REPOSITORY_URL>

# Navigate into the project
cd <YOUR_PROJECT_DIRECTORY>

# Install dependencies
npm install

# Create your local environment file
cp .env.local.example .env.local

# Configure your environment variables
# Start the development server
npm run dev
```

Open http://localhost:3000 in your browser.

**Note:** Replace the repository URL and project directory with your actual RedANT GitHub details. Complete the required Supabase and Meta configuration before using the application.

---

## Environment Configuration

Configure the environment variables required by the application in your `.env.local` file.

Typical configuration areas include:

* Supabase project URL and keys.
* WhatsApp Business Platform credentials.
* Meta application configuration.
* Encryption keys.
* AI provider API keys, if AI features are enabled.

Refer to the environment example file and the project's deployment documentation for the exact variable names and required values.

**Security:** Never commit `.env.local`, API keys, access tokens, or other secrets to GitHub. Use your hosting provider's secure environment variable settings for production.

---

## WhatsApp Business API Setup

RedANT integrates with the official WhatsApp Business Platform.

To connect a business WhatsApp account, you may need:

1. A Meta Business Portfolio.
2. A WhatsApp Business Account (WABA).
3. A registered or eligible business phone number.
4. The required Meta app configuration and permissions.
5. WhatsApp webhook configuration.
6. Valid access tokens and other required credentials.

The connection process depends on your Meta setup and the WhatsApp integration configured in your deployment.

WhatsApp messaging must comply with Meta's policies, including applicable template, consent, and messaging requirements.

---

## Deployment

RedANT is built using Next.js and can be deployed to a compatible hosting environment.

For your deployment, configure:

* Your production domain.
* Required environment variables.
* Supabase production settings.
* WhatsApp webhook URL and verification.
* HTTPS and appropriate security settings.
* Database migrations and production access controls.

**Website:** https://redant.in

---

## Security & Privacy

RedANT uses application security mechanisms that may include:

* Role-based access control.
* Supabase Row-Level Security.
* Secure handling of application credentials.
* Webhook verification.
* API key access controls.
* Rate limiting and application security headers.

Security depends on the deployed version, configuration, and operational practices.

Keep your credentials private and ensure that production access is properly restricted.

For customer-facing deployments, provide an appropriate privacy policy and comply with applicable data protection requirements.

---

## Documentation

For product information, business enquiries, and RedANT updates:

* **Website:** [redant.in](https://redant.in)
* **GitHub:** Add your official RedANT repository URL here.
* **Documentation:** Add your official RedANT documentation URL here.

---

## Contributing

RedANT is developed and maintained as part of the RedANT platform.

Contributions, bug reports, and suggestions can be submitted through the project's GitHub repository, subject to the repository's contribution guidelines.

Before submitting changes, please ensure that:

* The code follows the project's existing conventions.
* No secrets or credentials are included.
* Relevant checks and tests are completed.
* Changes are documented where necessary.

---

## License & Attribution

This repository is distributed under the MIT License, subject to the terms of the included `LICENSE` file.

If this project is derived from or incorporates code from another repository, retain the original copyright notices, license terms, and required attributions.

Original project: [ArnasDon/wacrm](https://github.com/ArnasDon/wacrm)

---

## Contact

**RedANT — WhatsApp CRM & Business Automation**

Website: https://redant.in

Helping businesses manage conversations, automate customer communication, and grow with smarter WhatsApp workflows.

**RedANT — Smarter Conversations. Better Business.**
