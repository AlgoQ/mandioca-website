-- Create FAQ table and sync data
-- Run this in Supabase SQL Editor

-- =============================================
-- CREATE FAQ TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS faq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_es TEXT,
  answer TEXT NOT NULL,
  answer_es TEXT,
  display_order INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_faq_hostel_id ON faq(hostel_id);

-- Enable RLS
ALTER TABLE faq ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drop if exist first to avoid errors)
DROP POLICY IF EXISTS "Public can view faq" ON faq;
DROP POLICY IF EXISTS "Service role full access faq" ON faq;

CREATE POLICY "Public can view faq" ON faq FOR SELECT USING (visible = true);
CREATE POLICY "Service role full access faq" ON faq FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- INSERT FAQ DATA
-- =============================================
-- Delete existing FAQs first
DELETE FROM faq WHERE hostel_id = (SELECT id FROM hostels LIMIT 1);

-- Insert all 11 FAQ items
INSERT INTO faq (hostel_id, question, question_es, answer, answer_es, display_order, visible)
SELECT
  (SELECT id FROM hostels LIMIT 1) as hostel_id,
  question,
  question_es,
  answer,
  answer_es,
  display_order,
  visible
FROM (VALUES
  ('What time is check-in and check-out?', '¿Cuál es el horario de check-in y check-out?', 'Check-in is from 11:00 AM and check-out is by 12:00 PM. We offer free luggage storage if you arrive early or leave late - just ask at reception!', 'El check-in es desde las 11:00 y el check-out es hasta las 12:00. Ofrecemos guardaequipaje gratis si llegas temprano o te vas tarde - ¡solo pregunta en recepción!', 1, true),
  ('How do I get to the hostel from the airport?', '¿Cómo llego al hostel desde el aeropuerto?', 'Silvio Pettirossi International Airport is about 15km from the hostel. The easiest options are: Uber/Bolt for around $10-15, or a taxi for around $20. We can arrange airport pickup for you - just let us know your arrival time!', 'El Aeropuerto Internacional Silvio Pettirossi está a unos 15km del hostel. Las opciones más fáciles son: Uber/Bolt por unos $10-15, o taxi por unos $20. Podemos organizar un traslado del aeropuerto - ¡solo avísanos tu hora de llegada!', 2, true),
  ('Is breakfast included in the price?', '¿El desayuno está incluido?', 'We have a fully equipped kitchen where you can prepare your own meals! The kitchen includes refrigerators, blender, toaster, gas stove, microwave, and all the dishes you need. There are also many affordable breakfast spots nearby.', '¡Tenemos una cocina totalmente equipada donde puedes preparar tus propias comidas! La cocina incluye heladera, licuadora, tostadora, anafe a gas, microondas y todos los platos que necesitas. También hay muchos lugares económicos para desayunar cerca.', 3, true),
  ('Do you have private rooms?', '¿Tienen habitaciones privadas?', 'Yes! We offer private rooms with king-size beds and private bathrooms. All rooms are air-conditioned and include a wardrobe and work desk. Private rooms start at around $30 per night.', '¡Sí! Ofrecemos habitaciones privadas con camas king y baños privados. Todas las habitaciones tienen aire acondicionado e incluyen armario y escritorio. Las habitaciones privadas empiezan en unos $30 por noche.', 4, true),
  ('Are pets allowed?', '¿Se permiten mascotas?', 'Yes! We are pet-friendly and pets stay for free. Just let us know in advance if you are bringing a furry friend.', '¡Sí! Somos pet-friendly y las mascotas se quedan gratis. Solo avísanos con anticipación si traes un amigo peludo.', 5, true),
  ('Is there a pool?', '¿Hay piscina?', 'Yes! We have an outdoor swimming pool in our garden patio. It''s the perfect way to cool off from Asunción''s heat and meet other travelers.', '¡Sí! Tenemos una piscina exterior en nuestro patio jardín. Es la manera perfecta de refrescarse del calor de Asunción y conocer otros viajeros.', 6, true),
  ('Can I use the BBQ/Quincho area?', '¿Puedo usar el área de quincho/parrilla?', 'Absolutely! Our quincho (BBQ area) with wood-fired oven is available for all guests. It''s perfect for cooking asado (Paraguayan BBQ) and sharing meals with fellow travelers.', '¡Por supuesto! Nuestro quincho con horno de leña está disponible para todos los huéspedes. Es perfecto para hacer asado paraguayo y compartir comidas con otros viajeros.', 7, true),
  ('Is the WiFi free and reliable?', '¿El WiFi es gratis y confiable?', 'Yes! We offer free high-speed WiFi throughout the hostel - in all rooms, common areas, and even in the garden.', '¡Sí! Ofrecemos WiFi de alta velocidad gratis en todo el hostel - en todas las habitaciones, áreas comunes y hasta en el jardín.', 8, true),
  ('What is the cancellation policy?', '¿Cuál es la política de cancelación?', 'Free cancellation up to 24 hours before check-in for a full refund. Cancellations within 24 hours or no-shows will be charged for the first night.', 'Cancelación gratuita hasta 24 horas antes del check-in para un reembolso completo. Las cancelaciones dentro de las 24 horas o no-shows serán cobradas por la primera noche.', 9, true),
  ('How is your rating calculated?', '¿Cómo se calcula la calificación?', 'Our 9.6 rating is the average score across all booking platforms where Mandioca Hostel is listed, including HostelWorld, Booking.com, and Google Reviews. We are proud to be the #1 rated hostel in Asunción!', 'Nuestra calificación de 9.6 es el promedio de todas las plataformas de reservas donde Mandioca Hostel está listado, incluyendo HostelWorld, Booking.com y Google Reviews. ¡Estamos orgullosos de ser el hostel #1 de Asunción!', 10, true),
  ('Is the area safe?', '¿Es segura la zona?', 'Yes, we''re located in downtown Asunción, a safe and well-connected area. Our staff can give you tips on exploring the city safely and recommend the best places to visit.', 'Sí, estamos ubicados en el centro de Asunción, una zona segura y bien conectada. Nuestro staff puede darte consejos para explorar la ciudad de forma segura y recomendarte los mejores lugares para visitar.', 11, true)
) AS t(question, question_es, answer, answer_es, display_order, visible);
