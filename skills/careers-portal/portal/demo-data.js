// Sample data for demo mode. Acme Inc. and everything about it is invented.
// The shape matches the settings and jobs tables in supabase/schema.sql.
(function () {
  const day = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

  window.DEMO_DATA = {
    settings: {
      company_name: "Acme Inc.",
      tagline: "Industrial supplies, Singapore",
      about: "We're a team of about 40 people supplying tools, safety gear and spare parts to workshops, shipyards and factories across Singapore. Most orders leave our Tuas warehouse the same day.",
      careers_email: "careers@acme.example",
      privacy_contact: "privacy@acme.example",
      retention_days: 180,
      show_pay: true,
      brand_primary: "#1F4E79",
      logo_url: "",
      website_url: "",
      highlights: [
        { title: "Training from day one", text: "Forklift, first aid and product training are paid for and done in work hours." },
        { title: "Predictable hours", text: "Warehouse and delivery shifts are set a month ahead, so you can plan your week." },
        { title: "Small enough to know everyone", text: "You'll work with the people who run the company, not through layers of managers." }
      ]
    },
    jobs: [
      {
        id: "8a1f0c2e-0000-4000-8000-000000000001",
        slug: "warehouse-supervisor",
        title: "Warehouse Supervisor",
        department: "Operations",
        location: "Tuas, Singapore",
        work_mode: "onsite",
        employment_type: "full_time",
        summary: "Lead a day-shift team of eight and keep same-day orders leaving on time.",
        description: "You'll run the warehouse floor on the day shift: planning the pick schedule, keeping stock counts accurate and making sure everyone goes home safe.\n\n## What you'll do\n- Plan and assign the day's picking, packing and loading\n- Lead a team of eight warehouse assistants and two forklift operators\n- Run weekly cycle counts and sort out stock differences\n- Keep the floor safe and up to date with workplace safety requirements\n- Work with the delivery team so trucks leave on schedule",
        requirements: "## What we're looking for\n- 5 or more years in a warehouse, with at least 2 leading a team\n- Comfortable with a warehouse management system and spreadsheets\n- A forklift licence is a plus\n\n## Nice to have\n- Experience with industrial or marine supplies",
        pay_text: "S$3,800 to S$4,500 a month",
        closes_on: day(28),
        status: "open"
      },
      {
        id: "8a1f0c2e-0000-4000-8000-000000000002",
        slug: "accounts-executive",
        title: "Accounts Executive",
        department: "Finance",
        location: "Tuas, Singapore",
        work_mode: "hybrid",
        employment_type: "full_time",
        summary: "Own accounts payable and receivable, bank reconciliations and the monthly close.",
        description: "You'll keep our books accurate and our suppliers and customers paid on time, working closely with the finance manager.\n\n## What you'll do\n- Process supplier invoices and payments\n- Issue customer invoices and follow up on overdue accounts\n- Reconcile bank accounts every week\n- Prepare schedules for the monthly close and GST filing",
        requirements: "## What we're looking for\n- A diploma or degree in accounting\n- 2 or more years in a similar role\n- Confident with cloud accounting software\n\n## Nice to have\n- Experience in a trading or distribution business",
        pay_text: "",
        closes_on: day(21),
        status: "open"
      },
      {
        id: "8a1f0c2e-0000-4000-8000-000000000003",
        slug: "delivery-driver-class-3",
        title: "Delivery Driver (Class 3)",
        department: "Logistics",
        location: "Tuas, Singapore",
        work_mode: "onsite",
        employment_type: "full_time",
        summary: "Deliver orders to workshops and shipyards across Singapore. Early starts, done by mid-afternoon.",
        description: "You'll drive one of our light trucks on a planned route and be the face of Acme for many of our customers.\n\n## What you'll do\n- Load, check and deliver 12 to 20 orders a day\n- Collect signatures and returns\n- Keep the truck clean and report any issues",
        requirements: "## What we're looking for\n- A valid Class 3 licence and a clean driving record\n- Able to lift up to 25 kg\n- Basic English for delivery notes",
        pay_text: "S$2,600 to S$3,000 a month, plus overtime",
        closes_on: day(5),
        status: "open"
      },
      {
        id: "8a1f0c2e-0000-4000-8000-000000000004",
        slug: "sales-coordinator",
        title: "Sales Coordinator",
        department: "Sales",
        location: "Singapore",
        work_mode: "hybrid",
        employment_type: "full_time",
        summary: "Turn customer enquiries into quotations and keep every follow-up on track.",
        description: "You'll support our three account managers so customers get fast, accurate quotations.\n\n## What you'll do\n- Prepare quotations from enquiries and price lists\n- Follow up on open quotations\n- Keep customer records up to date in our CRM",
        requirements: "## What we're looking for\n- 1 or more years in sales support or customer service\n- Organised and good with spreadsheets\n- Clear written English",
        pay_text: "",
        closes_on: day(30),
        status: "open"
      },
      {
        id: "8a1f0c2e-0000-4000-8000-000000000005",
        slug: "marketing-intern",
        title: "Marketing Intern",
        department: "Marketing",
        location: "Remote",
        work_mode: "remote",
        employment_type: "internship",
        summary: "A three-month internship on product photos, social posts and our website.",
        description: "You'll help us show customers what we stock and why it matters.\n\n## What you'll do\n- Photograph and write up new products\n- Plan and draft social media posts\n- Keep product pages on our website up to date",
        requirements: "## What we're looking for\n- Studying marketing, design or communications\n- A portfolio or a few examples of your work",
        pay_text: "S$1,000 a month",
        closes_on: day(12),
        status: "open"
      }
    ]
  };
})();
