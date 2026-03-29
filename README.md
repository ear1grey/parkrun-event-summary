# parkrun Event Summary

## What is this?

This is a Chrome extension that creates an infographic about the results from a particular parkrun. The infographic is generated when you visit the latest results page, or a single-event results page (including URLs that use an event date such as `/results/2026-03-28/`, or a numeric segment where your country site still uses that form).

For example, open the latest results for [Portsmouth Lakeside](https://www.parkrun.org.uk/portsmouthlakeside/results/latestresults/) and the infographic is added just under the header.

## Why does it exist?

I was inspired to create it when I saw a really cool infographic at my local parkrun, that was generated using a PowerPoint slide (that I think might have been) created by Steve Tyler (for Rushmoor parkrun) that may in turn have been based on [a design](https://www.facebook.com/greatsalternsparkrun/photos/pb.100080505252730.-2207520000/181070371149452/?type=3) by Ian Gregory (an RD at Great Salterns) - there are many examples on the Rushmoor and Great Salterns Parkrun results pages. The process of getting the data into Powerpoint is quite cumbersome, so I wanted to see if I could simplify it, thus a chrome extension that builds the whole image in-page automatically (with no hunting-down or typing-in of numbers).

## Will it explode?

No.

Please note that this _is_ currently **beta release** software - i.e. it may not work perfectly, _yet_. It was released in Jan 2024 and is actively being developed.

## Development

- `npm test` — Vitest unit tests for shared helpers
- `npm run lint` — ESLint on application sources (vendor bundles excluded)
- `npm run format` — Prettier
- `npm run build` — produce `pes.zip` for the packaged extension

Pushes and pull requests to `main` trigger GitHub Actions: lint runs in parallel with tests; the packaging step runs after both succeed and uploads `pes.zip` as an artifact.

## Can I help?

Quite probably!

If you code, fork [the repo](https://github.com/ear1grey/parkrun-event-summary), add stuff, send me a pull request.

If you have an idea, a feature request, or want to report a bug, please [write about it here](https://github.com/ear1grey/parkrun-event-summary/issues).

## Is this an official parkrun tool?

No. This tool is not affiliated in any way with PARKRUN LIMITED who oversee parkrun events.

# Privacy Policy

This extension uses only publicly accessible data that it aggregates to form a summary infographic (that is anonymised as a byproduct of the aggregation). Neither the infographic nor any data are stored by the extension.
