// Mock Scenarios for SlothDigest
// Realistic chat transcripts designed to demonstrate the power of local Gemma 2 + Mastra + Sentry

export const SCENARIOS = [
  {
    id: 'family-whatsapp',
    title: '👨‍👩‍👧‍👦 The 142-Message Family WhatsApp Panic',
    subtitle: 'Lost reading glasses, recipe debates, dog photos & birthday drama',
    category: 'Personal / Family',
    messageCount: 142,
    rawTextLength: '3,840 chars',
    estimatedReadTime: '8.5 mins',
    rawMessages: `[06:45 AM] Mom: Good morning everyone! Has anyone seen my floral reading glasses? I had them near the microwave yesterday.
[06:48 AM] Aunt Linda: Good morning Mary! No I haven't seen them. Did you check under the sofa cushions? Buster was chewing on something plastic earlier! 🐶
[06:49 AM] Aunt Linda: [Photo: Golden retriever Buster looking guilty with a shoe]
[06:51 AM] Uncle Dave: That dog is innocent Linda. Look at his sweet eyes. By the way, are we still having Sunday dinner at 5 or 6?
[06:52 AM] Mom: Found them! Nevermind! They were in the vegetable crisper in the fridge next to the celery. 🤦‍♀️
[06:54 AM] Cousin Brian: Classic Mom fridge storage haha!
[06:55 AM] Sister Chloe: Hey guys, about Sunday dinner: I'm bringing the vegan chocolate tart. Also, Mom, can we push dinner to 6:30 PM? Brian has soccer practice until 5:45 PM.
[06:58 AM] Uncle Dave: 6:30 is too late for dessert! Football starts at 8!
[07:01 AM] Aunt Linda: Dave, football can wait, family comes first!
[07:03 AM] Uncle Dave: It's the playoffs Linda!!
[07:05 AM] Mom: OK stop arguing! Sunday dinner is at 6:30 PM sharp at my house. Dave you can watch the first quarter in the den.
[07:10 AM] Mom: @Alex (You) - Can you pick up two loaves of garlic sourdough bread from the bakery on 4th street on your way here?
[07:12 AM] Sister Chloe: Ooh yes the garlic sourdough! Also Alex, remember to RSVP for Aunt Linda's garden party next month so she stops texting in ALL CAPS.
[07:15 AM] Aunt Linda: I DO NOT TEXT IN ALL CAPS CHLOE THAT WAS ONE TIME MY FINGER SLIPPED ON THE KEYBOARD.
[07:18 AM] Cousin Brian: [Meme: Homer Simpson backing into bushes]
[07:22 AM] Aunt Linda: What does the yellow man in the bush mean? Is that a video game?
[07:25 AM] Uncle Dave: God bless the mute button.
[07:30 AM] Mom: Sunday 6:30 PM. Alex brings garlic bread. Dave brings ginger ale. See everyone Sunday! Love you all! ❤️`,
    summary: {
      twoLineDigest: [
        "Aunt Linda's glasses were safely rescued from the vegetable crisper, and Sunday family dinner is finalized for 6:30 PM at Mom's house.",
        "Your sole task: Pick up 2 loaves of garlic sourdough bread on your way over and tell Aunt Linda her dog is cute. 140 lines of chaos successfully ignored."
      ],
      actionsForUser: [
        { task: "Pick up 2 loaves of garlic sourdough bread from 4th Street bakery on Sunday afternoon", urgency: "Medium", effort: "Low (5 mins)" },
        { task: "RSVP to Aunt Linda's garden party whenever you feel like it", urgency: "Low", effort: "Zero (1 tap)" }
      ],
      dramaAnalysis: {
        detectedFlamewars: 2,
        dramaDescription: "Uncle Dave vs. Aunt Linda regarding Sunday kickoff vs. dessert timing; Chloe poking fun at Aunt Linda's Caps Lock usage.",
        suppressionVerdict: "100% Ignorable petty banter. No emotional investment needed."
      },
      metrics: {
        noiseRatio: "91.5%",
        doomscrollMinutesSaved: 9,
        brainEnergyConserved: "97.4%",
        tokensProcessed: 894,
        tokensGenerated: 168
      }
    }
  },
  {
    id: 'slack-incident',
    title: '🚨 The 2:40 AM Slack #incident-war-room',
    subtitle: 'Kafka consumer lag, frantic stacktraces, 6 devs panicking while you slept',
    category: 'Work / DevOps',
    messageCount: 94,
    rawTextLength: '4,620 chars',
    estimatedReadTime: '12.0 mins',
    rawMessages: `[02:40:12 AM] bot-pagerduty: [CRITICAL P1] Service 'payment-ledger-v2' consumer lag exceeded 850,000 records on partition 4. SLA breach imminent.
[02:41:05 AM] dev-sarah: I am online. Checking Grafana dashboards. Lag is climbing 50k events per minute.
[02:42:18 AM] dev-marcus: Looks like the database connection pool is exhausted on node-us-east-1a!
[02:43:00 AM] dev-sarah: Wait, DB CPU is only at 18%. Why would the pool be starved?
[02:44:22 AM] dev-marcus: [Stack trace snippet: TimeoutException: Timed out waiting for connection from pool after 30000ms at com.zaxxer.hikari.pool.HikariPool.getConnection]
[02:46:10 AM] dev-kavita: Did anyone deploy to prod late last night? Who was on the 8 PM merge train?
[02:47:33 AM] dev-marcus: @Alex merged the retry-backoff fix at 7:30 PM! Could that be leaking connections?
[02:48:40 AM] dev-sarah: No, wait, Alex's PR was only touching the mock testing harness in staging, it never hit prod cluster.
[02:50:15 AM] dev-kavita: Phew, okay. So what broke?
[02:52:00 AM] lead-chen: I just woke up. Looking at the partition rebalance logs in Datadog.
[02:54:10 AM] lead-chen: It's not a DB issue. AWS auto-migrated Kafka broker-03 for emergency hypervisor patching. Broker-03 took partition 4 offline momentarily, causing the consumer group to deadlock on rebalance.
[02:56:00 AM] dev-marcus: Should we roll back?
[02:56:45 AM] lead-chen: No rollback needed. Running 'systemctl restart kafka-consumer-group-ledger' to force a fresh partition sync.
[02:58:30 AM] lead-chen: Command executed. Consumer group re-joined. Lag draining at 120k records/sec.
[03:12:00 AM] dev-sarah: Lag is down to 0 across all 16 partitions. P99 latency returned to 18ms.
[03:14:15 AM] lead-chen: War room closed. All systems 100% nominal. Everyone go back to sleep. I'll write the postmortem blurb for standup.`,
    summary: {
      twoLineDigest: [
        "A P1 Kafka consumer lag alert fired at 2:40 AM due to an AWS hypervisor patch; Lead Chen restarted the consumer group at 2:56 AM and latency fully recovered.",
        "Your action: Absolutely nothing. You were briefly suspected of breaking prod, but teammates verified your PR was staging-only. Sleep soundly."
      ],
      actionsForUser: [
        { task: "Do not touch anything. Lead Chen is handling the postmortem summary for standup.", urgency: "None", effort: "0 seconds" }
      ],
      dramaAnalysis: {
        detectedFlamewars: 1,
        dramaDescription: "Temporary panic where teammates questioned your 7:30 PM merge before Sarah checked git log and cleared your name.",
        suppressionVerdict: "Danger averted while you slept. Zero crisis involvement required."
      },
      metrics: {
        noiseRatio: "94.8%",
        doomscrollMinutesSaved: 14,
        brainEnergyConserved: "99.1%",
        tokensProcessed: 1120,
        tokensGenerated: 184
      }
    }
  },
  {
    id: 'discord-fomo',
    title: '💬 The 190-Message Web3 & Tech Discord FOMO',
    subtitle: 'Coin pump hype, Rust vs. Zig religious war, and one buried free pizza announcement',
    category: 'Community / Discord',
    messageCount: 190,
    rawTextLength: '5,210 chars',
    estimatedReadTime: '15.5 mins',
    rawMessages: `[11:02 PM] CryptoChad: GUYS DID YOU SEE $MOONSLOTH?? UP 40% IN 15 MINUTES LFG!! 🚀🚀
[11:03 PM] PixelPanda: Probably a rugpull Chad, check the liquidity lock.
[11:04 PM] CryptoChad: HAVE FUN STAYING POOR BRO!
[11:07 PM] RustFanatic: Why are people buying memecoins when they could be rewriting their microservices in Rust?
[11:09 PM] ZigEnjoyer: Because life is too short to fight the borrow checker for 6 hours just to parse a JSON file. Zig comptime is the future.
[11:10 PM] RustFanatic: Memory safety is not negotiable! Zig has zero runtime memory guarantees without manual allocators!
[11:12 PM] ZigEnjoyer: Skill issue. Just don't leak memory.
[11:14 PM] [28 messages debating manual memory allocation, Valgrind, and RAII semantics]
[11:38 PM] DevOrganizer: Hey everyone! Quick community announcement amidst the debate: We booked the rooftop lounge at 5th & Main for our monthly Open Source Showcase next Thursday at 7:00 PM. Free wood-fired pizza and craft drinks sponsored by the local dev meetup! Please RSVP via the link in #announcements by Tuesday so we get the catering headcount right.
[11:41 PM] CryptoChad: WILL THERE BE SLOTH SHIRTS?
[11:42 PM] DevOrganizer: Yes, free Hacktoberfest stickers and shirts for all attendees.
[11:45 PM] RustFanatic: Will the pizza be memory safe?
[11:46 PM] ZigEnjoyer: Only if it doesn't have undefined toppings.
[11:50 PM] CryptoChad: $MOONSLOTH just dumped 42% lol nvm don't buy it guys
[11:52 PM] PixelPanda: Told ya.
[12:15 AM] NightOwl: Anyone playing Helldivers 2 tonight? Need +1 for difficulty 9.`,
    summary: {
      twoLineDigest: [
        "An obscure memecoin pumped and instantly crashed, while two developers argued endlessly about Rust memory safety vs Zig comptime.",
        "The only signal: Free rooftop pizza and Hacktoberfest swag next Thursday at 7:00 PM (RSVP link in #announcements by Tuesday if hungry)."
      ],
      actionsForUser: [
        { task: "RSVP in #announcements by Tuesday if you want free rooftop pizza and stickers next Thursday at 7 PM", urgency: "Low", effort: "1 click" }
      ],
      dramaAnalysis: {
        detectedFlamewars: 2,
        dramaDescription: "High-octane Rust vs. Zig compiler debate (35 messages) + memecoin trader emotional rollercoaster.",
        suppressionVerdict: "Filtered out 188 lines of ideological nerd combat and trading noise."
      },
      metrics: {
        noiseRatio: "96.2%",
        doomscrollMinutesSaved: 16,
        brainEnergyConserved: "98.5%",
        tokensProcessed: 1280,
        tokensGenerated: 192
      }
    }
  }
];
