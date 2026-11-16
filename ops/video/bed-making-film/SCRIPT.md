# Eagle Bed — "From Sketch to Sleep"

An animated brand film for YouTube (about 76 seconds).
Style: flat 2D illustration with warm workshop light, deep navy and gold palette, Playfair Display headlines and Inter for supporting text.
Cast: a fictional animated family team (an older maker with a grey beard, a woman with her hair in a bun, a younger maker with red hair) and a delivery colleague. They are cartoon characters, not real people, and they are never named.

Produced files (same folder):
- `eagle-bed-film_16x9.mp4`: 1920x1080, 30 fps, 76.5 s, H.264 with AAC music
- `eagle-bed-film_9x16.mp4`: 1080x1920, 30 fps, 76.5 s, vertical cut for Shorts, Reels and TikTok
- `scenes/`: one still per scene in each format, for review and thumbnails
- `render_film.py` and `build_film.sh`: the code that draws and assembles the film, so it can be re-rendered or edited

The rendered film has music and on-screen text but **no recorded voiceover**. No text-to-speech voice could be reached from this environment. The voiceover lines below are timed to the scenes and can be recorded later, by a family member or a voice artist, and laid over the existing cut.

---

## Scenes

Timecodes are for the finished cut. Each scene crossfades into the next over 0.6 s.

### 1. The sketch (0:00–0:07, 7 s)
- **Visuals:** Morning in the Dewsbury workshop: navy panelled walls, a pegboard of tools and fabric rolls, warm light through a window over terraced rooftops, and sawdust drifting in the light. The older maker stands at the workbench and draws a headboard on a drafting board. The pencil line grows across the paper: an arched headboard, the base, then the dots where the buttons will go.
- **On-screen text:** "Every bed starts with a sketch" / "Handmade to order in our own Dewsbury workshop"
- **Voiceover:** "Every Eagle Bed starts here, with a pencil and a sketch, in our own workshop in Dewsbury."

### 2. Timber cut and frame joined (0:06–0:14, 8 s)
- **Visuals:** The woman saws a length of timber on the bench as sawdust falls, and the cut piece drops away. The shot dissolves to the frame being joined: the rails and posts slide into place, gold sparks flash at each joint, the maker taps the joints with a mallet, and the slats go in one by one.
- **On-screen text:** "Solid timber, cut and joined" / "A strong frame, built by hand"
- **Voiceover:** "We cut solid timber and join every frame by hand."

### 3. Foam and padding (0:13–0:21, 7 s)
- **Visuals:** An arched plywood headboard panel stands on the bench. A foam layer drops onto it and settles with a soft squash. A roll of white padding then unrolls down over the foam while the younger maker pats it smooth.
- **On-screen text:** "Foam and padding, layer by layer"
- **Voiceover:** "Then come the foam and soft padding, layer by layer."

### 4. Choosing the fabric (0:20–0:28, 7.5 s)
- **Visuals:** Four swatch cards fan up onto the bench, labelled plush velvet, chenille, Naples and teddy bouclé, each with its own texture. The woman reaches up and picks the navy plush velvet. The card lifts and grows while the others fade back.
- **On-screen text:** "Choose your fabric" / "Plush velvet · Chenille · Naples · Teddy bouclé"
- **Voiceover:** "You choose the fabric, from plush velvet and chenille to Naples and teddy bouclé."

### 5. Stitching and buttoning the headboard (0:27–0:35, 8 s)
- **Visuals:** The headboard, now covered in navy velvet with gold piping. The younger maker presses the buttons in one at a time, and each one pops in with a small gold sparkle as the diamond tufting lines form between them. A needle and gold thread move in the corner.
- **On-screen text:** "Stitched and buttoned by hand"
- **Voiceover:** "Each headboard is stitched and buttoned by hand."

### 6. Upholstering (0:34–0:41, 7 s)
- **Visuals:** The bare timber bed base rests on trestles. The maker works along it from left to right with a staple gun. Navy velvet wraps the base behind him, and gold puffs mark each staple.
- **On-screen text:** "Upholstered with care"
- **Voiceover:** "Then we upholster it, right here in Dewsbury."

### 7. Quality check by the family team (0:40–0:48, 7 s)
- **Visuals:** The finished bed stands in the workshop. The maker holds a clipboard and the other two stand beside the bed. A checklist card slides in and three items tick off in gold: "Frame & joints", "Stitching & buttons" and "Fabric finish". The whole team nods and smiles.
- **On-screen text:** "Checked by our family team"
- **Voiceover:** "Before it leaves, our family team checks every detail."

### 8. Van delivery (0:47–0:55, 8 s)
- **Visuals:** Outdoors on a bright day, with rolling green hills, hedgerows and clouds. A navy van marked with a gold "EAGLE BED · Handmade in Dewsbury" wordmark drives in along the road, with the hills moving at different speeds behind it. Three badges pop up: England, Scotland, Wales. The van slows and stops outside a brick house.
- **On-screen text:** "Free delivery by our own team" / "Across England, Scotland and Wales"
- **Voiceover:** "Delivery is free across England, Scotland and Wales, by our own team."

### 9. Assembly in the home (0:54–1:01, 7 s)
- **Visuals:** A bright bedroom. Two of the team carry the pieces in from each side, and the headboard and base meet in the middle with a gold sparkle. The mattress drops neatly onto the bed.
- **On-screen text:** "We assemble it in your room"
- **Voiceover:** "And we'll assemble it for you, in your room."

### 10. Dream bedroom reveal (1:01–1:11, 10 s)
- **Visuals:** Day turns to evening. The wall deepens to navy, a crescent moon and twinkling stars appear in the arched window, and the two bedside lamps glow on. The finished bed has a buttoned navy velvet headboard, cream pillows and duvet, and a gold throw, with a plant and rug beside it. The camera pushes in slowly.
- **On-screen text:** "Your dream bed, made for you" / "Single to super king · 14-day free returns · 5-year frame warranty · Klarna & Clearpay"
- **Voiceover:** "Handmade to order, from single to super king, with a five-year frame warranty, fourteen-day free returns, and Klarna or Clearpay at checkout."

### 11. End card (1:10–1:16, 6 s)
- **Visuals:** A navy gradient with soft gold sparkles. Two thin gold lines frame the wordmark, and the text fades up in three steps.
- **On-screen text:** "EAGLE BED" / "Handmade in Dewsbury" / "eaglebed.co.uk" / "Family-run · Handmade to order · Free delivery & assembly"
- **Voiceover:** "Eagle Bed. Handmade in Dewsbury. Find yours at eaglebed.co.uk."

**Music:** the Eagle Bed track `tools/cinema/music/luxury.mp3`. It is 24 s long, so it is looped with 2 s crossfades, faded in over 1 s and faded out over the last 3 s.

---

## YouTube

**Title** (58 characters)
How a Handmade Bed Is Made | Eagle Bed, Dewsbury Workshop

**Description**
From a pencil sketch to your bedroom: watch how an Eagle Bed comes to life in our own workshop in Dewsbury, West Yorkshire.

We're a family-run business, and every bed is handmade to order. We cut and join a solid timber frame, add foam and padding, then stitch, button and upholster it in the fabric you choose, from plush velvet and chenille to Naples and teddy bouclé. Our family team checks every bed before it leaves the workshop.

• Sizes from single to super king
• Free delivery across England, Scotland and Wales by our own team, who assemble the bed in your room
• 14-day free returns
• 5-year frame warranty
• Pay with Klarna or Clearpay

Find your bed: https://www.eaglebed.co.uk/?utm_source=youtube&utm_medium=video&utm_campaign=bed_film

#EagleBed #HandmadeBeds #MadeInYorkshire

**Tags**
1. Eagle Bed
2. handmade beds
3. upholstered beds UK
4. made in Yorkshire
5. Dewsbury
6. velvet bed
7. buttoned headboard
8. how beds are made
9. family run business
10. bedroom inspiration

---

## Compliance check
- Uses only the facts supplied: family-run; handmade to order in our own Dewsbury workshop; solid timber frames; plush velvet, chenille, Naples and teddy bouclé; single to super king; free delivery across England, Scotland and Wales by our own team, with assembly; 14-day free returns; 5-year frame warranty; Klarna and Clearpay.
- None of these words or claims appear: best, leading, award, hotel, medical, orthopaedic, fire-safety, sleep trial, 0% or interest-free, discount percentages.
- All characters are fictional cartoons. No real people are shown or named, and no logo was invented: "EAGLE BED" appears only as a typeset wordmark.
- Fabric colours in the film are illustrative only. They are not claims about the colours on sale.
