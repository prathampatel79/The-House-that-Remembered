/**
 * The House That Remembered - Story & Narrative Configuration
 * 
 * Centralized story text configuration.
 * All dialogue, subtitles, inspection descriptions, objectives,
 * the final secret paragraphs, and morning ending texts are configured here
 * so narrative content can be refined without modifying game logic.
 */

const STORY_CONFIG = {
    // 1. Objectives Progression
    objectives: {
        prologue: {
            title: "Blackwood Road",
            text: "Follow the road home in the quiet evening."
        },
        curiosity: {
            title: "Curiosity",
            text: "Approach the entrance of the abandoned Sen estate."
        },
        wakingUp: {
            title: "Waking Up",
            text: "Find a way out."
        },
        investigateLiving: {
            title: "The Living Quarters",
            text: "Search the first floor for clues about the family's sudden disappearance."
        },
        investigateUpper: {
            title: "Upper Floor",
            text: "Explore the second floor and locate the sealed chamber."
        },
        surveillanceRoom: {
            title: "The Watcher",
            text: "Examine the surveillance maps and uncover who was monitoring the house."
        },
        groundFloorDoor: {
            title: "The Cellar",
            text: "Unlock the reinforced ground-floor cellar door using the antique brass key."
        },
        descendArchive: {
            title: "The Subterranean Vault",
            text: "Descend into the underground archive and uncover the final truth."
        },
        finalClue: {
            title: "The Final Testament",
            text: "Examine the confidential ledger on the central stone archive table."
        },
        morningReflect: {
            title: "Dawn",
            text: "Look upon the quiet house in the morning light."
        }
    },

    // 2. Door & Boundary Subtitles
    doors: {
        frontDoorEarly: "It's locked.",
        frontDoorLate: "Bolted tight from the outside. Whatever happened in this house, the way out is tied to the truth hidden beneath it.",
        cellarLocked: "Locked with heavy antique brass fittings. The keyhole bears an ornate sun and pendant seal.",
        cellarUnlocked: "The antique brass key turns smoothly. The cellar door swings open.",
        frontDoorMorning: "The front door is sealed shut. The house has surrendered its memories."
    },

    // 3. Waking Up in Bedroom Subtitles
    bedroomAwakening: [
        "Ugh... my head... Where am I?",
        "The door slammed shut behind me... Someone locked me inside.",
        "I need to find a way out."
    ],

    // 4. Final Secret Cinematic Revelation (Blank Screen Text)
    // Displayed line by line on a pure black background after examining the final ground-floor clue.
    finalSecretParagraphs: [
        "The family never abandoned this house.",
        "They discovered the truth behind the pendant\nand knew that someone would eventually come looking.",
        "The pendant was passed down through Nisha's family.",
        "It eventually reached you.",
        "You were never a stranger to this house.",
        "You were the person they had been waiting for."
    ],

    // 5. Unconscious Transition Subtitles
    unconsciousTransition: "A sudden wave of exhaustion washes over... The underground vault grows quiet... Everything is slipping away...",

    // 6. Morning Scene Outside Subtitles & Thoughts
    morningSequence: [
        "The cold morning breeze... The air smells of wet pine and dawn.",
        "The silver pendant rests cold against my chest. It was with me all along.",
        "Everything that happened inside this house... was real.",
        "What happened inside the house will never be forgotten."
    ]
};

// Expose globally for browser usage
window.STORY_CONFIG = STORY_CONFIG;
