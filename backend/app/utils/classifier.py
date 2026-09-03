"""
Complaint classification & routing logic.

The user picks a category on the frontend (six fixed types). This module:
  1. Optionally re-confirms/refines category from free-text description via keyword matching
     (useful if you later add a "not sure, describe it" free-text-only flow).
  2. Assigns a priority level to each category.
  3. Determines which staff_type a complaint should be routed to.

Keep this simple keyword approach as a starting point — swap in an ML/NLP model later
if you want smarter free-text classification.
"""
from ..models import ComplaintCategory, Priority, StaffType

# Keyword hints per category (used only for optional free-text auto-suggestion)
CATEGORY_KEYWORDS = {
    ComplaintCategory.hygiene_cleanliness: [
        "dirty", "unclean", "smell", "stink", "washroom", "toilet", "seat dirty",
        "corridor dirty", "trash", "garbage", "unhygienic coach",
    ],
    ComplaintCategory.food_related: [
        "food", "meal", "catering", "overpriced", "stale", "unhygienic food",
        "pantry", "menu", "bill",
    ],
    ComplaintCategory.staff_related: [
        "rude", "staff", "unresponsive", "misbehaved", "attendant", "tte", "conductor",
    ],
    ComplaintCategory.unknown_passenger: [
        "unknown", "occupying", "occupied", "unauthorized", "not my seat", "stranger",
    ],
    ComplaintCategory.public_nuisance: [
        "screaming", "brawl", "fight", "shouting", "nuisance", "drunk", "harassment",
    ],
    ComplaintCategory.non_urgent: [
        "dustbin", "bin", "broken", "repair", "bulb", "fan", "leak", "seat missing",
        "platform seat",
    ],
}

# Priority per category
CATEGORY_PRIORITY = {
    ComplaintCategory.public_nuisance: Priority.high,
    ComplaintCategory.unknown_passenger: Priority.high,
    ComplaintCategory.staff_related: Priority.medium,
    ComplaintCategory.hygiene_cleanliness: Priority.medium,
    ComplaintCategory.food_related: Priority.medium,
    ComplaintCategory.non_urgent: Priority.low,
}

# Which staff type handles each category.
# NOTE: the spec didn't explicitly say who handles "food_related" — routed to
# management (catering falls under station/train management) by default.
# Adjust freely.
CATEGORY_STAFF_MAP = {
    ComplaintCategory.public_nuisance: StaffType.guard,
    ComplaintCategory.unknown_passenger: StaffType.guard,
    ComplaintCategory.hygiene_cleanliness: StaffType.cleaning_crew,
    ComplaintCategory.food_related: StaffType.management,
    ComplaintCategory.staff_related: StaffType.management,
    ComplaintCategory.non_urgent: StaffType.management,
}


def get_priority(category: ComplaintCategory) -> Priority:
    return CATEGORY_PRIORITY.get(category, Priority.medium)


def get_recommended_staff_type(category: ComplaintCategory) -> StaffType:
    return CATEGORY_STAFF_MAP.get(category, StaffType.management)


from typing import Optional
def suggest_category_from_text(text: str) -> Optional[ComplaintCategory]:
    """Best-effort keyword classifier for free-text descriptions. Returns None if unsure."""
    if not text:
        return None
    text_lower = text.lower()
    scores = {cat: 0 for cat in ComplaintCategory}
    for cat, keywords in CATEGORY_KEYWORDS.items():
        for kw in keywords:
            if kw in text_lower:
                scores[cat] += 1
    best_cat = max(scores, key=scores.get)
    if scores[best_cat] == 0:
        return None
    return best_cat
