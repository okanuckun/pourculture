-- =============================================================
-- Seed real wine knowledge data
-- =============================================================

-- GLOSSARY TERMS (comprehensive natural wine terminology)
INSERT INTO public.glossary_terms (term, definition) VALUES
  ('Amphora', 'A clay vessel used for fermenting and aging wine, popular in Georgian and natural winemaking traditions. Provides gentle oxidation and imparts earthy, mineral character.'),
  ('Ancestral Method', 'The oldest method of making sparkling wine (méthode ancestrale). The wine is bottled before primary fermentation is complete, creating natural carbonation. Used for Pét-Nat.'),
  ('Batonnage', 'The process of stirring lees (dead yeast cells) back into wine during aging to add texture, complexity, and mouthfeel.'),
  ('Biodynamic', 'A holistic farming philosophy developed by Rudolf Steiner that treats the vineyard as a self-sustaining ecosystem. Follows a lunar calendar for planting, pruning, and harvesting. Certified by Demeter.'),
  ('Brett (Brettanomyces)', 'A wild yeast that can develop in wine, producing aromas described as barnyard, leather, or Band-Aid. Considered a fault in conventional wine but sometimes embraced in natural wine for complexity.'),
  ('Carbonic Maceration', 'A fermentation technique where whole grape clusters are placed in a sealed vessel filled with CO2. Produces light, fruity, low-tannin wines. Beaujolais Nouveau is the most famous example.'),
  ('Cold Soak', 'Pre-fermentation maceration at cool temperatures to extract color and fruit character from grape skins without extracting harsh tannins.'),
  ('Conventional Wine', 'Wine produced using modern agricultural techniques including synthetic pesticides, herbicides, commercial yeasts, and various additives. The opposite of natural wine.'),
  ('Cuvée', 'A specific blend or batch of wine. In natural winemaking, often refers to a winemaker''s particular expression of their terroir.'),
  ('Elevage', 'The aging and maturation process of wine between fermentation and bottling. Can take place in barrels, tanks, amphora, or other vessels.'),
  ('Field Blend', 'A wine made from multiple grape varieties grown together in the same vineyard and harvested and fermented at the same time. Common in traditional Portuguese and Austrian winemaking.'),
  ('Flor', 'A film of yeast that forms on the surface of wine during aging, protecting it from oxidation. Essential in making Sherry and Jura vin jaune.'),
  ('Glou-Glou', 'French slang for an easy-drinking, gulpable natural wine. Light, refreshing, and meant to be enjoyed without overthinking.'),
  ('Indigenous Yeast', 'Wild yeasts naturally present on grape skins and in the winery environment, used for spontaneous fermentation instead of commercial yeast strains. Also called native or ambient yeast.'),
  ('Lees', 'Dead yeast cells and grape particles that settle at the bottom of a vessel after fermentation. Extended contact with lees (sur lie aging) adds texture and complexity.'),
  ('Low Intervention', 'A winemaking approach that minimizes chemical and technological manipulation. The philosophy behind natural wine — let the grapes express themselves.'),
  ('Maceration', 'The soaking of grape skins, seeds, and sometimes stems in grape juice to extract color, tannins, and flavor compounds. Extended maceration of white grapes produces orange wine.'),
  ('Malolactic Fermentation', 'A secondary fermentation where tart malic acid is converted to softer lactic acid by bacteria. Occurs naturally in most red wines and many natural white wines.'),
  ('Minimal Sulfites', 'Natural wines typically use very low or zero added sulfites (SO2). Conventional wines may contain 10-20x more sulfites than natural wines.'),
  ('Must', 'Freshly pressed grape juice that contains the skins, seeds, and stems. The starting material for winemaking.'),
  ('Natural Wine', 'Wine made from organically or biodynamically grown grapes with minimal intervention in the cellar. No additives, no commercial yeast, no fining or filtration, minimal or zero sulfites.'),
  ('Negociant', 'A wine merchant who buys grapes or wine from growers and produces wine under their own label. Some natural wine negociants work closely with specific farmers.'),
  ('Orange Wine', 'White wine made with extended skin contact (maceration), giving it an amber/orange color, tannic structure, and complex flavors. Ancient technique revived by natural winemakers, especially in Georgia, Slovenia, and Friuli.'),
  ('Organic Wine', 'Wine made from grapes grown without synthetic pesticides, herbicides, or fertilizers. Certified organic (EU, USDA, etc.). Note: organic wine is not necessarily natural wine — organic wines may still use additives in the cellar.'),
  ('Oxidative Winemaking', 'Deliberately exposing wine to oxygen during aging, producing nutty, sherry-like characters. Common in Jura wines (vin jaune) and some natural wines.'),
  ('Pét-Nat (Pétillant Naturel)', 'Naturally sparkling wine made by bottling during primary fermentation (ancestral method). Often cloudy, funky, and unpredictable. The natural wine world''s answer to Champagne.'),
  ('Phenolic', 'Compounds in grapes (tannins, anthocyanins, flavonoids) that contribute to color, texture, and aging potential. Skin-contact whites have higher phenolic content.'),
  ('QVEVRI', 'Traditional Georgian clay vessels buried underground, used for fermenting and aging wine for 6,000+ years. UNESCO Intangible Cultural Heritage. The original amphora.'),
  ('Racking', 'Transferring wine from one vessel to another, leaving sediment behind. Done gently in natural winemaking to minimize oxygen exposure.'),
  ('Reduction', 'Aromas caused by lack of oxygen, such as matchstick, rubber, or cooked cabbage. Common in wines sealed under screwcap or in reductive winemaking. Usually blows off with aeration.'),
  ('Skin Contact', 'The practice of leaving grape juice in contact with skins during or after fermentation. All red wines involve skin contact; when applied to white grapes, it produces orange wine.'),
  ('Spontaneous Fermentation', 'Fermentation initiated by indigenous yeasts rather than added commercial yeast. Results in more complex, terroir-expressive wines but is riskier and less predictable.'),
  ('Sulfites (SO2)', 'Sulfur dioxide, used as a preservative and antioxidant in wine. Natural wines use minimal (under 30mg/L) or zero added sulfites. Some SO2 is produced naturally during fermentation.'),
  ('Sur Lie', 'Aging wine on its lees (dead yeast). Adds richness, bread-like flavors, and creamy texture. Common in Muscadet and many natural wines.'),
  ('Tannin', 'Polyphenolic compounds from grape skins, seeds, and stems that create a drying, astringent sensation in the mouth. Provide structure and aging potential in red wines.'),
  ('Terroir', 'The complete natural environment where wine is produced — soil, climate, topography, and biodiversity. Natural winemakers believe minimal intervention best expresses terroir.'),
  ('Ullage', 'The air space between wine and the top of a barrel or bottle. Managing ullage is crucial in natural winemaking where sulfites aren''t used to protect against oxidation.'),
  ('Unfined', 'Wine that has not been treated with fining agents (egg whites, casein, gelite, bentonite) to remove particles. Most natural wines are unfined, resulting in cloudiness.'),
  ('Unfiltered', 'Wine that has not been passed through a filter to remove sediment and microorganisms. Natural wines are typically unfiltered, which preserves flavor complexity but may appear cloudy.'),
  ('Vigneron', 'French term for a wine grower who also makes wine from their own grapes. In natural wine, the vigneron philosophy emphasizes the farmer-winemaker connection.'),
  ('Volatile Acidity (VA)', 'Acetic acid in wine, often described as vinegar-like. Small amounts add complexity; excessive VA is considered a fault. More common in natural wines without sulfite protection.'),
  ('Whole Cluster', 'Fermenting with entire grape clusters including stems. Adds tannin structure, herbal character, and can create carbonic maceration effects. Popular in natural Pinot Noir and Syrah.'),
  ('Zero-Zero (0/0)', 'Wine made with absolutely zero additives and zero sulfites. The purest expression of natural wine.')
ON CONFLICT DO NOTHING;

-- GUIDES
INSERT INTO public.guides (title, description, read_time, category, is_published, content) VALUES
  ('How to Taste Natural Wine', 'A complete beginner''s guide to understanding, appreciating, and evaluating natural wines. Learn what makes them different and how to train your palate.', '8 min read', 'Beginner', true,
   'Natural wine tasting is different from conventional wine tasting. Here''s what to expect and how to approach it.

**Look:** Natural wines can be cloudy, hazy, or have sediment — this is normal and intentional. Orange wines will have amber hues. Don''t judge by clarity alone.

**Smell:** Give the wine time to open. Natural wines often show funky aromas at first (barnyard, cider, kombucha) that evolve into complex fruit and floral notes. Let the glass breathe for 15-20 minutes.

**Taste:** Expect more texture and acidity than conventional wines. Natural wines are often lighter in body but more complex in flavor. Look for a sense of place — does the wine taste like somewhere specific?

**Feel:** Pay attention to how the wine sits in your mouth. Natural wines often have a lively, electric quality from their natural acidity and lack of manipulation.

**After:** Natural wines tend to have a clean finish without the "coating" sensation of heavily sulfited wines. You should feel refreshed, not weighed down.'),

  ('Understanding Orange Wine', 'Everything you need to know about orange wine — the ancient style that''s revolutionizing modern winemaking.', '6 min read', 'Beginner', true,
   'Orange wine is having a moment, but it''s actually the oldest style of winemaking in the world.

**What is it?** White wine made with extended skin contact — anywhere from days to months. The skins give the wine its amber/orange color and tannic structure.

**History:** This technique originated in Georgia over 6,000 years ago, where wine was fermented in qvevri (clay vessels) buried underground. It was revived in the 1990s by producers in Friuli (Italy) and Slovenia.

**How it tastes:** Expect dried fruit, honey, tea, nuts, and sometimes a pleasant bitterness. Orange wines have tannins like red wine but aromatics like white wine — truly a category of their own.

**Food pairing:** Incredibly versatile. Try with Middle Eastern cuisine, aged cheeses, roasted vegetables, or Asian dishes. The tannin structure handles spice beautifully.

**Key producers to try:** Radikon (Friuli), Gravner (Friuli), Pheasant''s Tears (Georgia), Vodopivec (Carso), COS (Sicily).'),

  ('Biodynamic Farming Explained', 'Dive deep into biodynamic viticulture — the spiritual and scientific approach to growing wine grapes.', '10 min read', 'Intermediate', true,
   'Biodynamics goes beyond organic farming by treating the vineyard as a living organism connected to cosmic rhythms.

**Origins:** Developed by Austrian philosopher Rudolf Steiner in 1924, biodynamics applies homeopathic preparations and follows a lunar/astronomical calendar.

**The Preparations:** Nine numbered preparations (500-508) made from herbs, minerals, and animal materials. The most famous: Preparation 500 (cow horn manure) and 501 (cow horn silica).

**The Calendar:** Planting, pruning, and harvesting follow a biodynamic calendar based on lunar and planetary positions. Days are categorized as root, leaf, flower, or fruit days.

**Does it work?** Debate continues, but results speak: many of the world''s greatest wines come from biodynamic estates. Domaine Leroy, Domaine de la Romanée-Conti (converting), Zind-Humbrecht, and Nikolaihof all practice biodynamics.

**Certification:** Demeter is the primary biodynamic certifier. Requirements are stricter than organic certification.'),

  ('Natural Wine Faults vs Features', 'Learn to distinguish between intentional winemaking choices and actual faults in natural wine.', '7 min read', 'Advanced', true,
   'One of the biggest challenges in natural wine is knowing when something unusual is a feature or a fault.

**Features (intentional):**
- Cloudiness/haze: From being unfiltered. Shake gently if sediment settles.
- Funky aromatics: Brett, cider-like, or kombucha notes that add complexity.
- Slight spritz: Residual CO2 from fermentation, adds freshness.
- Oxidative notes: Nutty, sherry-like character (Jura style).

**Faults (problematic):**
- Excessive volatile acidity: Smells like nail polish remover or strong vinegar.
- Mouse taint: A persistent, unpleasant flavor on the palate (like mouse cage). Cannot be fixed.
- TCA cork taint: Musty, wet cardboard smell. Not specific to natural wine.
- Excessive reduction: Rotten eggs or burnt rubber that doesn''t blow off after 30+ minutes.

**The gray zone:** Some producers deliberately push boundaries. What one person calls a fault, another calls terroir expression. The key: does the wine give you pleasure?'),

  ('Building a Natural Wine Cellar', 'Practical guide to starting and maintaining a collection of natural wines at home.', '6 min read', 'Intermediate', true,
   'Natural wines have different storage needs than conventional wines.

**Temperature:** 12-14°C (54-57°F) is ideal. Consistency matters more than exact temperature — avoid fluctuations.

**Light:** Keep wines in the dark. Natural wines without sulfites are more light-sensitive.

**Position:** Store on their side to keep corks moist. Crown-capped Pét-Nats can stand upright.

**Drinking window:** Most natural wines are made to drink young (1-3 years). Some age beautifully (skin-contact whites, structured reds), but don''t cellar everything.

**What to stock:**
- Everyday glou-glou (6-12 bottles, drink within months)
- Seasonal orange wines (4-6 bottles)
- Age-worthy reds from serious producers (2-4 bottles per vintage)
- Pét-Nat for celebrations (always have 2-3 cold)

**Budget tip:** Many exceptional natural wines cost €10-20. You don''t need to spend a fortune.')
ON CONFLICT DO NOTHING;

-- HARVEST REPORTS
INSERT INTO public.harvest_reports (year, region, summary, highlights, is_published) VALUES
  (2025, 'Loire Valley, France', 'A warm, dry vintage that produced concentrated wines with excellent fruit expression. Spring frosts were a concern but most vineyards escaped damage. Chenin Blanc showed exceptional balance between ripeness and Loire''s signature acidity.',
   ARRAY['Early budburst due to warm March', 'Minimal disease pressure from dry summer', 'Harvest began late August for sparkling, mid-September for still wines', 'Outstanding Chenin Blanc and Cabernet Franc quality'], true),
  (2025, 'Beaujolais, France', 'An excellent vintage for Gamay. Warm days and cool nights preserved acidity while achieving full phenolic ripeness. Natural winemakers reported clean, healthy fruit requiring minimal intervention.',
   ARRAY['Ideal conditions for carbonic maceration', 'Low yields concentrated flavors', 'Exceptional Morgon and Fleurie', 'Best vintage since 2020 for cru Beaujolais'], true),
  (2025, 'Tuscany, Italy', 'A challenging but ultimately rewarding vintage. August heatwave stressed some vineyards, but September rains and cooler temperatures allowed late-ripening Sangiovese to recover beautifully.',
   ARRAY['August temperatures exceeded 40°C in some areas', 'September rainfall saved the vintage', 'Higher-altitude vineyards performed best', 'Brunello producers optimistic about aging potential'], true),
  (2024, 'Jura, France', 'A classic Jura vintage with the cool-climate elegance the region is known for. Extended hang time produced Savagnin and Chardonnay with remarkable complexity. Excellent conditions for vin jaune production.',
   ARRAY['Cool growing season preserved high acidity', 'Long autumn allowed extended ripening', 'Exceptional Savagnin for oxidative aging', 'Trousseau showed surprising depth'], true),
  (2024, 'Georgia (Kakheti)', 'An outstanding vintage for qvevri wines. Moderate temperatures and timely rainfall produced Rkatsiteli and Saperavi grapes of exceptional quality. Amber wine production reached new heights.',
   ARRAY['Ideal balance of sun and rain', 'Rkatsiteli amber wines of exceptional complexity', 'Saperavi showed deep color and structure', 'Growing international recognition of Georgian natural wines'], true)
ON CONFLICT DO NOTHING;

-- PDF RESOURCES
INSERT INTO public.pdf_resources (title, description, pages, file_size, is_published, file_url) VALUES
  ('Natural Wine: A Complete Introduction', 'Comprehensive guide covering the history, philosophy, and practice of natural winemaking. From vineyard to glass.', 32, '3.2 MB', true, null),
  ('The Organic & Biodynamic Certification Guide', 'Understanding the differences between organic, biodynamic, and natural wine certifications. What each label means for the consumer.', 16, '1.8 MB', true, null),
  ('Wine Regions of Natural Wine', 'A visual guide to the world''s most important natural wine regions — from the Loire to Georgia, Jura to Australia.', 48, '5.1 MB', true, null),
  ('Food & Natural Wine Pairing Guide', 'Practical pairing suggestions for orange wines, pét-nats, skin-contact whites, and low-intervention reds.', 24, '2.7 MB', true, null)
ON CONFLICT DO NOTHING;
