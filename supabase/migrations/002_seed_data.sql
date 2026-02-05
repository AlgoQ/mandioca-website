-- Mandioca Hostel Seed Data
-- Run this after 001_initial_schema.sql

-- =============================================
-- INSERT MAIN HOSTEL
-- =============================================
INSERT INTO hostels (id, name, slug, city, country, address, description, short_description, rating, latitude, longitude)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Mandioca Hostel',
  'mandioca-hostel',
  'Asunción',
  'Paraguay',
  'Av. Colón 1090, Asunción, Paraguay',
  'Welcome to Mandioca Hostel, a gem in the heart of Asunción, Paraguay! We offer a super relaxed and fun atmosphere where you can feel right at home. Located right in downtown Asunción, our hostel is the perfect base to explore Paraguay''s vibrant capital.

Our friendly staff is here to make your stay unforgettable. Step outside and you''re surrounded by the city''s historic center, just minutes from the best attractions, restaurants, and nightlife. Whether you''re here to explore, work, or simply relax by the pool, Mandioca is your perfect destination.

At Mandioca, we believe travel is about connections. Our welcoming common areas, amazing grill area (quincho), and garden patio with pool create the perfect environment for meeting fellow travelers from around the world.',
  'Your home in the heart of Asunción, Paraguay',
  9.6,
  -25.2855854,
  -57.6497056
) ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- INSERT ROOMS
-- =============================================
INSERT INTO rooms (hostel_id, name, description, bed_count, room_type, price_per_night, max_guests, available, display_order, features)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    '8 Bed Mixed Dorm',
    'Perfect for solo travelers looking to meet new people. Features extra-wide twin beds with comfortable mattresses, air conditioning, and personal lockers.',
    8, 'dorm', 12.00, 1, true, 1,
    '["Extra-wide beds", "Air conditioning", "Personal lockers", "Shared bathroom"]'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    '12 Bed Mixed Dorm',
    'Our most social room type. Enjoy meeting travelers from around the world in our spacious dorm with comfortable beds and air conditioning.',
    12, 'dorm', 10.00, 1, true, 2,
    '["Extra-wide beds", "Air conditioning", "Personal lockers", "Great value"]'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'Private Room - King Bed',
    'Ideal for couples or those seeking privacy. Spacious and clean private room with a king-size bed, private bathroom with bidet, and air conditioning.',
    1, 'private', 30.00, 2, true, 3,
    '["King bed", "Private bathroom", "Air conditioning", "Work desk"]'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'Private Twin Room',
    'Perfect for friends traveling together. Features two single beds, private bathroom, air conditioning, and all the comfort you need.',
    2, 'private', 35.00, 2, true, 4,
    '["Twin beds", "Private bathroom", "Air conditioning", "Wardrobe"]'::jsonb
  );

-- =============================================
-- INSERT AMENITIES
-- =============================================
INSERT INTO amenities (hostel_id, name, name_es, icon, category, description, description_es, display_order)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Free WiFi', 'WiFi Gratis', 'wifi', 'facility', 'High-speed internet throughout', 'Internet de alta velocidad', 1),
  ('00000000-0000-0000-0000-000000000001', 'Swimming Pool', 'Piscina', 'pool', 'facility', 'Outdoor pool in the garden', 'Piscina exterior en el jardín', 2),
  ('00000000-0000-0000-0000-000000000001', 'Fully Equipped Kitchen', 'Cocina Equipada', 'kitchen', 'facility', 'Refrigerators, blender, microwave & more', 'Heladera, licuadora, microondas y más', 3),
  ('00000000-0000-0000-0000-000000000001', 'Quincho & BBQ', 'Quincho y Parrilla', 'bbq', 'facility', 'Amazing grill area with wood-fired oven', 'Increíble área de asado con horno de leña', 4),
  ('00000000-0000-0000-0000-000000000001', 'Garden Patio', 'Patio Jardín', 'garden', 'facility', 'Relax in our beautiful garden', 'Relajate en nuestro hermoso jardín', 5),
  ('00000000-0000-0000-0000-000000000001', 'Shared Lounge', 'Sala Común', 'common_area', 'facility', 'Comfortable sofas & game consoles', 'Sofás cómodos y consolas de juegos', 6),
  ('00000000-0000-0000-0000-000000000001', 'Bar', 'Bar', 'bar', 'facility', 'On-site bar for drinks & socializing', 'Bar para bebidas y socializar', 7),
  ('00000000-0000-0000-0000-000000000001', 'Air Conditioning', 'Aire Acondicionado', 'ac', 'facility', 'All rooms climate controlled', 'Todas las habitaciones climatizadas', 8),
  ('00000000-0000-0000-0000-000000000001', 'Personal Lockers', 'Lockers Personales', 'lockers', 'facility', 'Secure storage included', 'Almacenamiento seguro incluido', 9),
  ('00000000-0000-0000-0000-000000000001', 'Luggage Storage', 'Guarda Equipaje', 'luggage', 'service', 'Free before/after check-in', 'Gratis antes/después del check-in', 10),
  ('00000000-0000-0000-0000-000000000001', 'Tourist Info', 'Info Turística', 'tours', 'service', 'Reception with travel guides', 'Recepción con guías de viaje', 11),
  ('00000000-0000-0000-0000-000000000001', 'Pet Friendly', 'Pet Friendly', 'pets', 'service', 'Pets allowed and free!', '¡Mascotas permitidas y gratis!', 12);

-- =============================================
-- INSERT REVIEWS
-- =============================================
INSERT INTO reviews (hostel_id, guest_name, rating, comment, country, review_date, display_order, visible)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Sarah M.', 10, 'I''ve stayed at enough hostels in my life (minimum 150) and these folks are the sweetest people ever. The staff quickly become your friends!', 'United States', 'January 2026', 1, true),
  ('00000000-0000-0000-0000-000000000001', 'Marco B.', 10, 'A gem in Asunción with lovely hospitable staff and a welcoming atmosphere. I spent a lot of time just hanging out and cooking - such a great place to relax!', 'Argentina', 'December 2025', 2, true),
  ('00000000-0000-0000-0000-000000000001', 'Emma L.', 9, 'Amazing hostel in Asuncion! The outdoor area is very relaxing, and bedrooms, kitchen and bathrooms are super clean. Walking distance from everywhere.', 'Germany', 'November 2025', 3, true),
  ('00000000-0000-0000-0000-000000000001', 'Carlos R.', 10, 'Great hostel, the team was really friendly and helpful. The private rooms were lovely and clean with a big bathroom attached. Highly recommend!', 'Brazil', 'October 2025', 4, true),
  ('00000000-0000-0000-0000-000000000001', 'Julia W.', 10, 'Best hostel in Paraguay! The pool is perfect for the hot days, the quincho is amazing for BBQs, and the staff makes you feel like family.', 'Chile', 'October 2025', 5, true),
  ('00000000-0000-0000-0000-000000000001', 'Thomas K.', 9, 'Stayed here for a week and loved every minute. The location is perfect for exploring Asunción, and the common areas are great for meeting other travelers.', 'Australia', 'September 2025', 6, true),
  ('00000000-0000-0000-0000-000000000001', 'Ana P.', 10, 'El mejor hostel de Paraguay! El personal es increíble, las instalaciones son impecables y el ambiente es súper acogedor. Volveré seguro!', 'Spain', 'September 2025', 7, true),
  ('00000000-0000-0000-0000-000000000001', 'Lucas V.', 10, 'Perfect hostel for backpackers! Clean rooms, great WiFi, amazing pool area. The quincho nights are unforgettable. Highly recommended!', 'Netherlands', 'August 2025', 8, true),
  ('00000000-0000-0000-0000-000000000001', 'Marie C.', 10, 'The best place to stay in Asunción! The staff went above and beyond to help us plan our trip. The garden and pool area are perfect for relaxing after a day of exploring.', 'France', 'August 2025', 9, true),
  ('00000000-0000-0000-0000-000000000001', 'David H.', 9, 'Fantastic atmosphere and great value for money. The kitchen facilities are excellent and the quincho BBQ nights are a must. Made so many friends here!', 'United Kingdom', 'July 2025', 10, true),
  ('00000000-0000-0000-0000-000000000001', 'Sofia R.', 10, 'Absolutely loved my stay! The location is perfect, the beds are comfortable, and the staff treats you like family. Will definitely come back!', 'Colombia', 'July 2025', 11, true);

-- =============================================
-- INSERT FAQ
-- =============================================
INSERT INTO faq (hostel_id, question, question_es, answer, answer_es, display_order, visible)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'What time is check-in and check-out?', '¿Cuál es el horario de check-in y check-out?', 'Check-in is from 11:00 AM and check-out is by 12:00 PM. We offer free luggage storage if you arrive early or leave late - just ask at reception!', 'El check-in es desde las 11:00 y el check-out es hasta las 12:00. Ofrecemos guardaequipaje gratis si llegas temprano o te vas tarde - ¡solo pregunta en recepción!', 1, true),
  ('00000000-0000-0000-0000-000000000001', 'How do I get to the hostel from the airport?', '¿Cómo llego al hostel desde el aeropuerto?', 'Silvio Pettirossi International Airport is about 15km from the hostel. The easiest options are: Uber/Bolt for around $10-15, or a taxi for around $20. We can arrange airport pickup for you - just let us know your arrival time!', 'El Aeropuerto Internacional Silvio Pettirossi está a unos 15km del hostel. Las opciones más fáciles son: Uber/Bolt por unos $10-15, o taxi por unos $20. Podemos organizar un traslado del aeropuerto - ¡solo avísanos tu hora de llegada!', 2, true),
  ('00000000-0000-0000-0000-000000000001', 'Is breakfast included in the price?', '¿El desayuno está incluido?', 'We have a fully equipped kitchen where you can prepare your own meals! The kitchen includes refrigerators, blender, toaster, gas stove, microwave, and all the dishes you need. There are also many affordable breakfast spots nearby.', '¡Tenemos una cocina totalmente equipada donde puedes preparar tus propias comidas! La cocina incluye heladera, licuadora, tostadora, anafe a gas, microondas y todos los platos que necesitas. También hay muchos lugares económicos para desayunar cerca.', 3, true),
  ('00000000-0000-0000-0000-000000000001', 'Do you have private rooms?', '¿Tienen habitaciones privadas?', 'Yes! We offer private rooms with king-size beds and private bathrooms. All rooms are air-conditioned and include a wardrobe and work desk. Private rooms start at around $30 per night.', '¡Sí! Ofrecemos habitaciones privadas con camas king y baños privados. Todas las habitaciones tienen aire acondicionado e incluyen armario y escritorio. Las habitaciones privadas empiezan en unos $30 por noche.', 4, true),
  ('00000000-0000-0000-0000-000000000001', 'Are pets allowed?', '¿Se permiten mascotas?', 'Yes! We are pet-friendly and pets stay for free. Just let us know in advance if you are bringing a furry friend.', '¡Sí! Somos pet-friendly y las mascotas se quedan gratis. Solo avísanos con anticipación si traes un amigo peludo.', 5, true),
  ('00000000-0000-0000-0000-000000000001', 'Is there a pool?', '¿Hay piscina?', 'Yes! We have an outdoor swimming pool in our garden patio. It''s the perfect way to cool off from Asunción''s heat and meet other travelers.', '¡Sí! Tenemos una piscina exterior en nuestro patio jardín. Es la manera perfecta de refrescarse del calor de Asunción y conocer otros viajeros.', 6, true),
  ('00000000-0000-0000-0000-000000000001', 'Can I use the BBQ/Quincho area?', '¿Puedo usar el área de quincho/parrilla?', 'Absolutely! Our quincho (BBQ area) with wood-fired oven is available for all guests. It''s perfect for cooking asado (Paraguayan BBQ) and sharing meals with fellow travelers.', '¡Por supuesto! Nuestro quincho con horno de leña está disponible para todos los huéspedes. Es perfecto para hacer asado paraguayo y compartir comidas con otros viajeros.', 7, true),
  ('00000000-0000-0000-0000-000000000001', 'Is the WiFi free and reliable?', '¿El WiFi es gratis y confiable?', 'Yes! We offer free high-speed WiFi throughout the hostel - in all rooms, common areas, and even in the garden.', '¡Sí! Ofrecemos WiFi de alta velocidad gratis en todo el hostel - en todas las habitaciones, áreas comunes y hasta en el jardín.', 8, true),
  ('00000000-0000-0000-0000-000000000001', 'What is the cancellation policy?', '¿Cuál es la política de cancelación?', 'Free cancellation up to 24 hours before check-in for a full refund. Cancellations within 24 hours or no-shows will be charged for the first night.', 'Cancelación gratuita hasta 24 horas antes del check-in para un reembolso completo. Las cancelaciones dentro de las 24 horas o no-shows serán cobradas por la primera noche.', 9, true),
  ('00000000-0000-0000-0000-000000000001', 'How is your rating calculated?', '¿Cómo se calcula la calificación?', 'Our 9.6 rating is the average score across all booking platforms where Mandioca Hostel is listed, including HostelWorld, Booking.com, and Google Reviews. We are proud to be the #1 rated hostel in Asunción!', 'Nuestra calificación de 9.6 es el promedio de todas las plataformas de reservas donde Mandioca Hostel está listado, incluyendo HostelWorld, Booking.com y Google Reviews. ¡Estamos orgullosos de ser el hostel #1 de Asunción!', 10, true),
  ('00000000-0000-0000-0000-000000000001', 'Is the area safe?', '¿Es segura la zona?', 'Yes, we''re located in downtown Asunción, a safe and well-connected area. Our staff can give you tips on exploring the city safely and recommend the best places to visit.', 'Sí, estamos ubicados en el centro de Asunción, una zona segura y bien conectada. Nuestro staff puede darte consejos para explorar la ciudad de forma segura y recomendarte los mejores lugares para visitar.', 11, true);

-- =============================================
-- INSERT ACTIVITIES
-- =============================================
INSERT INTO activities (hostel_id, title, title_es, subtitle, subtitle_es, description, description_es, display_order, visible)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Legislative Palace', 'Palacio Legislativo', 'Historic Landmark', 'Monumento Histórico', 'Paraguay''s impressive Congress building with stunning neoclassical architecture. A must-see landmark featuring guided tours and beautiful gardens.', 'El impresionante edificio del Congreso de Paraguay con arquitectura neoclásica. Un hito imperdible con tours guiados y hermosos jardines.', 1, true),
  ('00000000-0000-0000-0000-000000000001', 'Costanera', 'Costanera', 'Waterfront Promenade', 'Paseo Costero', 'Beautiful riverside promenade perfect for walking, jogging, or enjoying sunset views over the Paraguay River. Great restaurants and outdoor activities.', 'Hermoso paseo junto al río perfecto para caminar, correr o disfrutar del atardecer sobre el Río Paraguay. Excelentes restaurantes y actividades al aire libre.', 2, true),
  ('00000000-0000-0000-0000-000000000001', 'Historic Center', 'Centro Histórico', 'Cultural Heart', 'Corazón Cultural', 'The heart of Asunción with the National Pantheon, Cathedral, and Plaza de los Héroes. Rich in history, culture, and authentic local atmosphere.', 'El corazón de Asunción con el Panteón Nacional, la Catedral y la Plaza de los Héroes. Rico en historia, cultura y ambiente local auténtico.', 3, true);

-- =============================================
-- INSERT CONTENT (dynamic text sections)
-- =============================================
INSERT INTO content (hostel_id, section, key, value_en, value_es)
VALUES
  -- Hero Section
  ('00000000-0000-0000-0000-000000000001', 'hero', 'hostelName', 'Mandioca Hostel', 'Mandioca Hostel'),
  ('00000000-0000-0000-0000-000000000001', 'hero', 'shortDescription', 'Your home in the heart of Asunción, Paraguay', 'Tu hogar en el corazón de Asunción, Paraguay'),
  ('00000000-0000-0000-0000-000000000001', 'hero', 'ratingText', 'Average Rating', 'Calificación Promedio'),

  -- About Section
  ('00000000-0000-0000-0000-000000000001', 'about', 'sectionTitle', 'About Our Hostel', 'Sobre Nosotros'),
  ('00000000-0000-0000-0000-000000000001', 'about', 'title', 'Your Home in Asunción''s Heart', 'Tu Hogar en el Corazón de Asunción'),

  -- Contact Section
  ('00000000-0000-0000-0000-000000000001', 'contact', 'phone', '+54 9 3704 95-1772', '+54 9 3704 95-1772'),
  ('00000000-0000-0000-0000-000000000001', 'contact', 'email', 'info@mandiocahostel.com', 'info@mandiocahostel.com'),
  ('00000000-0000-0000-0000-000000000001', 'contact', 'receptionHours', '24/7', '24/7')
ON CONFLICT (hostel_id, section, key) DO NOTHING;
