Over 2 million professionals have upgraded their business card scanning and lead capture with Covve Scan - join them today and experience unparalleled lead capture accuracy!

Enjoy a free trial for 14 days, then unlock unlimited scans through a one-off purchase or annual subscription.

⚡ Unrivaled business card scanning accuracy and speed
- Achieve market-leading business card scanning accuracy in over 60 languages and experience the fastest scan times, outperforming competitors like CamCard, ABBYY, and BizConnect.
- Scan QR codes to create leads from online profiles, digital business cards, LinkedIn and more.

📝 Organize and manage your business cards
- Add notes, groups, and locations to your scanned business cards for easy organization.
- Distil all your notes into a concise actionable summary.
- Keep your business card organizer up to date with grouping, tagging and search.
- Use AI-powered research and qualify your leads on the go, directly from their cards.

🚀 Export and share your business cards
- Save scanned business cards and leads directly to your phone contacts with one tap.
- Export your cards to Excel, Outlook, or Google Contacts.
- Share scanned business cards and leads with your team or assistant
- Integrate with all leading CRMs; Salesforce, HubSpot, Zoho and more.
- Integrate with any other platform using Zapier, ensuring every business card scan fits into your workflow.

🔒 Private and Secure
- Your scanned business cards are kept private, with terms and technology that safeguard your data.
- Covve Scan is developed in Europe, ensuring top-tier privacy protection.

📈 Why choose Covve Scan
Covve Scan is more than just a fast business card scanner – it’s a complete business card organizer and digital contact manager. From capturing every detail of your business cards and QRs with unrivaled accuracy to helping you manage, organize, and share, Covve Scan simplifies business card scanning like no other app.

"Just exceptional, a photo and everything fills in automatically. I bought the full version and it’s really great. In addition, you can export in CSV format – what a time saver! We tag keywords, and we easily find the contact. Thank you!"
(Store review, "Ben Linus," 05 April 2025)

Covve Scan is brought to you by the award-winning team behind Covve: Personal CRM.
Contact us anytime at support@covve.com.

Privacy policy and terms of use can be found at https://covve.com/scanner/privacy

### Building

Push to your repository to trigger builds, or manually trigger from Codemagic dashboard.

## Troubleshooting

### "Expo Go" Errors

If you see errors in Expo Go, you likely need a development build:

```bash
eas build --profile development --platform ios
# or
eas build --profile development --platform android
```

Expo Go has limited native module support. Development builds include all native code.

### Type Errors After Schema Changes

Regenerate database types:

```bash
npx supabase gen types typescript --project-id your-project-id > src/types/database.ts
```

### Push Notifications Not Working

1. Check device is physical (simulators don't support push)
2. Verify `google-services.json` is present for Android
3. Verify iOS push credentials in EAS
4. Check `fcm_tokens` column is being populated

## License

MIT
