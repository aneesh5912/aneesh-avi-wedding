ANEESH & AVI - SCROLL INVITATION

A standalone, mobile-friendly static website. No build, packages, account,
analytics, third-party fonts or backend are required.

LOCAL PREVIEW
Run the following command from this website folder:
  python3 -m http.server 8765 --bind 127.0.0.1
Then open http://127.0.0.1:8765 in a browser.
Use a local server: opening index.html directly cannot load JavaScript modules.

TESTS
  node --test tests/details.test.mjs

GITHUB PAGES
Only publish the contents of THIS website folder, not the parent project.
The parent contains video drafts and local asset-generation scripts.
1. Create a GitHub repository and upload this folder's contents to its root.
2. In Settings > Pages, choose Deploy from a branch.
3. Select the main branch and / (root), then Save.
4. GitHub provides an HTTPS URL once deployment finishes.
5. If deploying to a different URL, update og:url and og:image in index.html
   so WhatsApp and other link previews can find the invitation artwork.
All URLs in this site are relative and support a repository subpath.

PRIVACY AND MUSIC
Publishing makes the invitation, names, event schedule, venue and assets public.
Music was extracted locally from the reference video supplied for the invitation.
Confirm permission to publicly host that recording before publishing with music.
Music never autoplays; guests tap the music button.
No RSVP data or guest information is collected.
The page asks search engines not to index it; that is not access control.
Anyone with the URL can view it, and a public repository is publicly readable.

ACCESSIBILITY AND PERFORMANCE
The page works without JavaScript, including directions and calendar download.
Scroll opens the doors, reveals Day Two with a marigold shower, and lights up
the small diyas on either side of the Day Two schedule. The venue has its own
scroll-lit diyas and title reveal. Directions and address stay still.
Reduced-motion settings show the finished artwork and text without these effects.
Music is opt-in. Keyboard links and buttons have visible focus.
Artwork is local, and audio is not fetched until requested.

EDITING
Event data lives in details.mjs. Keep the matching content in index.html updated.
After changing dates, regenerate the downloadable calendar:
  node --input-type=module -e "import {writeFileSync} from 'node:fs'; import {createCalendar} from './details.mjs'; writeFileSync('celebrations.ics',createCalendar())"
The tests catch differences between event times, markup and calendar.
