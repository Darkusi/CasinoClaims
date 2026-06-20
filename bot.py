import threading
import time
from combined import (
    monitor_loop,
    daily_freebies_loop,
    claim_scheduler_loop,
    flood_discord_last_24h,
    FLASK_PORT,
)

print("=" * 50)
print("CLAIMS CASINO BOT — HEADLESS MODE")
print("=" * 50)
print()

monitor_thread = threading.Thread(target=monitor_loop, daemon=True)
monitor_thread.start()

daily_freebies_thread = threading.Thread(target=daily_freebies_loop, daemon=True)
daily_freebies_thread.start()

claim_thread = threading.Thread(target=claim_scheduler_loop, daemon=True)
claim_thread.start()

flood_thread = threading.Thread(target=flood_discord_last_24h, daemon=True)
flood_thread.start()

print("Bot threads started. Monitoring Reddit, posting to Discord, running claims.")
print("Press Ctrl+C to stop.\n")

try:
    while True:
        time.sleep(10)
except KeyboardInterrupt:
    print("\nBot stopped.")
