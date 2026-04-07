-- ============================================================
-- Pencilation — Fix corrupted service image_url values
-- Run this in phpMyAdmin > portrait_drawing_db > SQL tab
-- ============================================================

UPDATE `services` SET
    `title`       = 'Pencil Realism Art',
    `description` = '"BINI Mikha" - A breathtaking hyper-realistic pencil portrait, meticulously crafted to capture every fine detail and the most subtle micro-expressions for a truly lifelike finish.',
    `image_url`   = 'images/portrait_sample.png'
WHERE `id` = 1;

UPDATE `services` SET
    `title`       = 'Colored Drawing Art',
    `description` = '"Evil Demon Slayer" - A masterful triple-panel hand-drawn illustration with vibrant colored pencils, markers, and bold Japanese calligraphy.',
    `image_url`   = 'images/colored.jpg'
WHERE `id` = 2;

UPDATE `services` SET
    `title`       = 'Digital Drawing Art',
    `description` = '"ASEAN Diversity & DMMMSU Legacy" - A professional digital commission celebrating Southeast Asian unity, educational research, and cultural harmony.',
    `image_url`   = 'images/digital_art.png'
WHERE `id` = 3;

-- Verify the fix
SELECT id, title, image_url FROM services;
