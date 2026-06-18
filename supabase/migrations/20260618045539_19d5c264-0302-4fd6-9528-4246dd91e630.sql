CREATE POLICY "Authenticated read discentes" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'discentes');
CREATE POLICY "Authenticated insert discentes" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'discentes');
CREATE POLICY "Authenticated update discentes" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'discentes');
CREATE POLICY "Authenticated delete discentes" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'discentes');