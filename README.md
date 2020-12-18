# Ocado slot checker
Checks available Ocado delivery slots for you.

I built this at the start of the pandemic in 2020 when grocery delivery slots in London were rare and snapped up extremely quickly. It was a pretty hacky script which uses your Chrome browser cookies to log into Ocado via puppeteer and check whether any slots are available on the page. 

The script simply creates a cron job which fetches the booking page every minute and checks if any clickable links (indicating bookable slots) are available. If slots were available you would receive a desktop notification and could click it to be taken straight to the booking page.
