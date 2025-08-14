-- Row Level Security Policies for AYNAMODA
ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wardrobe_items_owner_select" ON public.wardrobe_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wardrobe_items_owner_modify" ON public.wardrobe_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "wardrobe_items_owner_delete" ON public.wardrobe_items FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "wardrobe_items_owner_insert" ON public.wardrobe_items FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "products_owner_select" ON public.products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "products_owner_modify" ON public.products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "products_owner_insert" ON public.products FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Adjust if actual schema differs.
