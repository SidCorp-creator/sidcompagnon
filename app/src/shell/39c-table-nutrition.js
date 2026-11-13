// @ts-nocheck
// Generated: edit supabase/functions/_shared/nutrition-table.js.
// Shared, pure browser/Edge module (v85). Reference nutrition table and the arithmetic Sid'Bot must never delegate to a model.
// Values per 100 g of edible food. Base: Ciqual 2025 (Anses) where a matching entry exists, USDA FoodData Central otherwise.
// Row: [name, aliases "a|b", state (r = raw/dry before cooking, c = cooked, "" = eaten as is), kcal, protein, carbs, fat, role, unit g, standard portion g, spoon g].
// role: starch | protein | fat | veg | fruit | dairy | sauce | sweet | other. unit g: mass of one piece (0 = none). spoon g: one tablespoon (0 = n/a).
function createNutritionTable() {
  const ROWS=[
    // céréales et féculents
    ["Flocons d'avoine","flocon avoine|avoine|porridge|oat|rolled oat|oatmeal","",374,13.4,60,7,"starch",0,40,10],
    ["Riz blanc cru","riz|riz blanc|riz long|white rice|rice","r",350,7,77.5,0.8,"starch",0,75,0],
    ["Riz blanc cuit","riz|riz blanc|riz long|white rice|rice","c",143,2.4,31.4,0.8,"starch",0,180,0],
    ["Riz basmati cru","riz basmati|basmati|riz thai|basmati rice","r",351,7.1,78.4,0.6,"starch",0,75,0],
    ["Riz basmati cuit","riz basmati|basmati|riz thai|basmati rice","c",148,3.2,32.4,0.4,"starch",0,180,0],
    ["Riz complet cru","riz complet|riz brun|brown rice","r",350,7,71.4,2.8,"starch",0,75,0],
    ["Riz complet cuit","riz complet|riz brun|brown rice","c",158,3.4,32.6,1.2,"starch",0,180,0],
    ["Pâtes crues","pate|pates|spaghetti|penne|tagliatelle|macaroni|coquillette|fusilli|pasta|nouille","r",364,12,72.7,1.6,"starch",0,80,0],
    ["Pâtes cuites","pate|pates|spaghetti|penne|tagliatelle|macaroni|coquillette|fusilli|pasta|nouille","c",167,6.1,31.4,1.1,"starch",0,200,0],
    ["Pâtes complètes crues","pate complete|pates completes|spaghetti complet|wholewheat pasta","r",353,11.8,67.6,2.2,"starch",0,80,0],
    ["Pâtes complètes cuites","pate complete|pates completes|spaghetti complet|wholewheat pasta","c",150,5.5,27.5,1.2,"starch",0,200,0],
    ["Semoule de blé crue","semoule|couscous|graine couscous","r",360,12.5,72,1.5,"starch",0,70,0],
    ["Semoule de blé cuite","semoule|couscous|graine couscous","c",130,4.5,26,0.5,"starch",0,180,0],
    ["Quinoa cru","quinoa","r",358,13.2,58.1,6.1,"starch",0,70,0],
    ["Quinoa cuit","quinoa","c",120,4.4,19.5,1.9,"starch",0,180,0],
    ["Boulgour cru","boulgour|bulgur","r",347,11.7,65.8,1.4,"starch",0,70,0],
    ["Boulgour cuit","boulgour|bulgur","c",105,3.5,20,0.5,"starch",0,180,0],
    ["Pomme de terre crue","pomme terre|patate|potato","r",80,2,16.2,0.1,"starch",150,250,0],
    ["Pomme de terre cuite à l'eau","pomme terre|patate|potato|pomme terre vapeur|pomme terre bouillie","c",81,1.8,16.8,0.3,"starch",150,250,0],
    ["Pomme de terre cuite au four","pomme terre four|pomme terre rotie|baked potato","c",91,2.5,19,0.1,"starch",150,250,0],
    ["Purée de pommes de terre","puree|puree pomme terre|mashed potato","",92,2,13.5,3.2,"starch",0,200,0],
    ["Patate douce crue","patate douce|sweet potato","r",81,1.6,17.1,0.1,"starch",200,250,0],
    ["Patate douce cuite","patate douce|sweet potato","c",79,1.7,16.3,0.2,"starch",200,250,0],
    ["Frites surgelées pour four, crues","frite|frites|frite four|frites four|oven fries|fries|french fries","r",142,2.4,21,4.7,"starch",0,200,0],
    ["Frites cuites au four","frite|frites|frite four|frites four|oven fries|fries|french fries","c",213,3.8,32.6,6.6,"starch",0,150,0],
    ["Frites cuites en friteuse","frite friteuse|frites friteuse|frite huile|frites frites|deep fried fries","c",258,3.3,32.7,11.9,"starch",0,150,0],
    ["Baguette","baguette|pain|pain blanc|bread","",277,8.9,55.4,1.4,"starch",0,60,0],
    ["Pain complet","pain complet|pain cereale|pain cereales|wholemeal bread","",247,9,44,2.2,"starch",35,70,0],
    ["Pain de mie","pain mie|toast|pain toaste|sandwich bread","",274,8,50,4,"starch",28,56,0],
    ["Pain de campagne","pain campagne|pain levain","",253,7.5,50,1.3,"starch",40,80,0],
    ["Pain pita","pita|pain pita","",249,7.5,48.8,1.5,"starch",60,60,0],
    ["Pain burger","pain burger|bun|pain hamburger","",272,9,48,4.5,"starch",55,55,0],
    ["Biscotte","biscotte|rusk","",394,10,73.2,5.4,"starch",8,24,0],
    ["Wrap de blé","wrap|tortilla|tortilla ble|galette ble|wrap ble|durum","",320,8,53,7.5,"starch",62,62,0],
    ["Tortilla de maïs","tortilla mais|wrap mais|corn tortilla","",316,6.1,58,5.6,"starch",30,60,0],
    ["Muesli","muesli|granola","",375,9.5,63,7.5,"starch",0,45,10],
    ["Corn flakes","corn flake|cornflake|cereale petit dejeuner|cereales petit dejeuner","",378,7,84,0.9,"starch",0,35,5],
    ["Galette de riz","galette riz|rice cake","",387,8,81,3,"starch",9,18,0],
    ["Farine de blé","farine|farine ble|flour","",348,10,72,1,"starch",0,30,10],
    ["Lentilles sèches","lentille|lentilles|lentille verte|lentil","r",327,25.1,44.5,1.8,"starch",0,70,0],
    ["Lentilles cuites","lentille|lentilles|lentille verte|lentil","c",125,10.1,16.2,0.6,"starch",0,200,0],
    ["Lentilles corail sèches","lentille corail|lentilles corail|red lentil","r",328,27.7,44.9,0.8,"starch",0,70,0],
    ["Lentilles corail cuites","lentille corail|lentilles corail|red lentil","c",123,10.6,15,0.5,"starch",0,200,0],
    ["Pois chiches secs","pois chiche|pois chiches|chickpea","r",350,20.5,47.5,6,"starch",0,70,0],
    ["Pois chiches cuits","pois chiche|pois chiches|chickpea|pois chiche conserve","c",148,8.3,17.7,3,"starch",0,180,0],
    ["Haricots rouges secs","haricot rouge|haricots rouges|kidney bean","r",314,22.5,46.1,1.1,"starch",0,70,0],
    ["Haricots rouges cuits","haricot rouge|haricots rouges|kidney bean","c",115,8.4,13,0.6,"starch",0,180,0],
    ["Haricots blancs cuits","haricot blanc|haricots blancs|white bean","c",118,7,14,0.6,"starch",0,180,0],
    // viandes
    ["Bœuf haché 5 % MG cru","boeuf hache 5|viande hachee 5|steak hache 5|hache 5","r",130,21.9,0.3,4.6,"protein",125,125,0],
    ["Bœuf haché 5 % MG cuit","boeuf hache 5|viande hachee 5|steak hache 5|hache 5","c",155,25.5,0,5.9,"protein",100,100,0],
    ["Bœuf haché 10 % MG cru","boeuf hache|viande hachee|steak hache|hache|boeuf hache 10|viande hachee 10|steak hache 10|ground beef|minced beef|haché","r",170,20,0,10,"protein",125,125,0],
    ["Bœuf haché 10 % MG cuit","boeuf hache|viande hachee|steak hache|hache|boeuf hache 10|viande hachee 10|steak hache 10|ground beef|minced beef","c",205,25,0,11.5,"protein",100,100,0],
    ["Bœuf haché 15 % MG cru","boeuf hache 15|viande hachee 15|steak hache 15|hache 15","r",209,18.5,0,15,"protein",125,125,0],
    ["Bœuf haché 15 % MG cuit","boeuf hache 15|viande hachee 15|steak hache 15|hache 15","c",250,25,0,16.5,"protein",100,100,0],
    ["Bœuf haché 20 % MG cru","boeuf hache 20|viande hachee 20|steak hache 20|hache 20","r",251,17.5,0,20,"protein",125,125,0],
    ["Steak de bœuf cru","steak|steak boeuf|bifteck|boeuf|rumsteck|entrecote|beef steak","r",148,21.6,0,6.8,"protein",150,150,0],
    ["Steak de bœuf grillé","steak|steak boeuf|bifteck|boeuf|rumsteck|entrecote|beef steak","c",171,27.6,0,6.7,"protein",120,120,0],
    ["Filet de poulet cru","poulet|filet poulet|blanc poulet|escalope poulet|chicken|chicken breast","r",110,23.4,0,1.5,"protein",150,150,0],
    ["Filet de poulet cuit","poulet|filet poulet|blanc poulet|escalope poulet|chicken|chicken breast","c",141,30.1,0,2,"protein",120,120,0],
    ["Cuisse de poulet crue","cuisse poulet|pilon poulet|chicken thigh","r",183,17.5,0,12.5,"protein",150,150,0],
    ["Cuisse de poulet rôtie","cuisse poulet|pilon poulet|chicken thigh|poulet roti","c",226,26,0,13.5,"protein",120,120,0],
    ["Escalope de dinde crue","dinde|escalope dinde|filet dinde|turkey","r",108,23.7,0,1.5,"protein",150,150,0],
    ["Escalope de dinde cuite","dinde|escalope dinde|filet dinde|turkey","c",124,28.5,0,1.1,"protein",120,120,0],
    ["Filet mignon de porc cru","porc|filet mignon|filet porc|pork","r",120,21.5,0,3.7,"protein",150,150,0],
    ["Filet mignon de porc cuit","porc|filet mignon|filet porc|pork","c",150,27,0,4.5,"protein",120,120,0],
    ["Côte de porc crue","cote porc|pork chop","r",164,19.8,0.4,9.3,"protein",150,150,0],
    ["Gigot d'agneau rôti","agneau|gigot|gigot agneau|lamb","c",216,26,0,12.5,"protein",120,120,0],
    ["Jambon blanc","jambon|jambon blanc|jambon cuit|ham","",113,20.5,0.9,3,"protein",40,80,0],
    ["Jambon cru","jambon cru|jambon sec|jambon serrano|jambon parme|jambon bayonne|prosciutto","",239,25.9,0.5,14.5,"protein",15,45,0],
    ["Blanc de poulet en tranches","blanc poulet tranche|blanc dinde|blanc dinde tranche|charcuterie poulet","",105,21,1.5,1.7,"protein",30,60,0],
    ["Lardons fumés crus","lardon|lardons|bacon","r",272,16.7,0.4,22.6,"protein",0,50,0],
    ["Merguez crue","merguez","r",301,13.8,1.2,26.8,"protein",55,110,0],
    ["Chipolata crue","chipolata|saucisse|sausage","r",266,14.9,0.8,22.6,"protein",55,110,0],
    // poissons, œufs, végétal
    ["Saumon cru","saumon|pave saumon|filet saumon|salmon","r",201,19.7,0,13.5,"protein",130,130,0],
    ["Saumon cuit","saumon|pave saumon|filet saumon|salmon","c",214,22.1,1,13.5,"protein",110,110,0],
    ["Saumon fumé","saumon fume|smoked salmon","",170,22.4,0.4,8.8,"protein",30,60,0],
    ["Cabillaud cru","cabillaud|morue|dos cabillaud|poisson blanc|cod","r",76,17.6,0,0.6,"protein",150,150,0],
    ["Cabillaud cuit","cabillaud|morue|dos cabillaud|poisson blanc|cod","c",95,21.5,0,0.9,"protein",120,120,0],
    ["Colin cru","colin|merlu|lieu|hake|pollock","r",83,17.6,0,1.4,"protein",150,150,0],
    ["Thon au naturel égoutté","thon|thon naturel|thon boite|thon conserve|tuna","",116,26,0,1,"protein",0,100,0],
    ["Thon cru","thon rouge|steak thon|thon frais","r",144,23.5,0,5.5,"protein",150,150,0],
    ["Crevettes cuites","crevette|crevettes|shrimp|prawn","c",91,20.5,0.2,0.8,"protein",0,100,0],
    ["Sardines à l'huile égouttées","sardine|sardines|sardine huile","",210,24,0,12.5,"protein",0,90,0],
    ["Maquereau cru","maquereau|mackerel","r",198,18.1,0.9,13.5,"protein",130,130,0],
    ["Poisson pané cuit","poisson pane|fish stick|baton poisson","c",230,12.5,19,11.5,"protein",30,120,0],
    ["Œuf entier","oeuf|oeufs|oeuf entier|egg|oeuf cru","",140,12.7,0.3,9.8,"protein",55,110,0],
    ["Œuf dur","oeuf dur|oeuf cuit|oeuf mollet|oeuf coque|boiled egg","c",134,13.5,0.5,8.6,"protein",55,110,0],
    ["Œuf au plat","oeuf plat|oeuf frit|oeuf poele|fried egg","c",196,13.6,0.8,15,"protein",50,100,0],
    ["Omelette","omelette|oeuf brouille|oeufs brouilles|scrambled egg","c",168,11.5,0.5,13.3,"protein",0,120,0],
    ["Blanc d'œuf","blanc oeuf|blancs oeuf|egg white","",48,10.8,0.7,0.1,"protein",33,100,0],
    ["Tofu nature","tofu","",147,13.4,2.9,8.5,"protein",0,125,0],
    ["Seitan","seitan","",134,20.6,6.7,2.5,"protein",0,100,0],
    ["Steak de soja","steak soja|steak vegetal|galette soja","",190,17,6,10,"protein",100,100,0],
    ["Protéine en poudre (whey)","whey|proteine poudre|proteine|shaker proteine|protein powder","",380,78,6,6,"protein",0,30,10],
    // laitages
    ["Lait demi-écrémé","lait|lait demi ecreme|milk","",48,3.5,5,1.6,"dairy",0,250,15],
    ["Lait entier","lait entier|whole milk","",65,3.5,4.8,3.6,"dairy",0,250,15],
    ["Lait écrémé","lait ecreme|skimmed milk","",34,3.6,5,0,"dairy",0,250,15],
    ["Boisson au soja nature","lait soja|boisson soja|soy milk","",39,3.3,1.5,2,"dairy",0,250,15],
    ["Boisson à l'avoine","lait avoine|boisson avoine|oat milk","",46,0.8,7.8,1.3,"dairy",0,250,15],
    ["Boisson à l'amande","lait amande|boisson amande|almond milk","",25,0.5,2.7,1.2,"dairy",0,250,15],
    ["Yaourt nature","yaourt|yaourt nature|yogourt|yoghurt|yogurt","",50,3.8,4.3,1.7,"dairy",125,125,20],
    ["Yaourt à la grecque","yaourt grec|yaourt grecque|greek yogurt","",103,3,3.7,8.2,"dairy",150,150,20],
    ["Skyr nature","skyr","",62,10.6,3.9,0.2,"protein",150,150,20],
    ["Fromage blanc 0 %","fromage blanc 0|fromage blanc maigre|quark maigre","",50,7.6,4.8,0.1,"protein",0,150,20],
    ["Fromage blanc 3 %","fromage blanc|quark|fromage blanc 3","",76,7.3,3.9,3.2,"dairy",0,150,20],
    ["Cottage cheese","cottage|cottage cheese","",98,11.1,3.4,4.3,"protein",0,150,20],
    ["Emmental","emmental|gruyere|fromage rape|fromage|cheese","",368,27.6,0.6,28.2,"fat",0,30,8],
    ["Comté","comte","",414,27,0,34,"fat",0,30,0],
    ["Mozzarella","mozzarella|mozza","",227,16.5,0.7,17.7,"fat",125,60,0],
    ["Cheddar","cheddar","",399,24.7,1.2,32.6,"fat",20,30,0],
    ["Parmesan","parmesan","",411,31.1,1.1,31,"fat",0,15,6],
    ["Feta","feta","",264,15.3,0.7,22.1,"fat",0,50,0],
    ["Camembert","camembert|brie","",275,19.2,1.3,21.5,"fat",0,30,0],
    ["Fromage de chèvre","chevre|fromage chevre|buche chevre","",290,18,1,24,"fat",0,30,0],
    ["Fromage frais à tartiner","fromage frais|fromage tartiner|cream cheese","",253,5.5,3,24.5,"fat",0,30,15],
    ["Crème fraîche 30 %","creme|creme fraiche|creme entiere|cream","",292,2.3,2.7,30,"fat",0,30,15],
    ["Crème légère 15 %","creme legere|creme 15|creme allegee","",162,2.6,4,15,"fat",0,30,15],
    // matières grasses, oléagineux
    ["Huile d'olive","huile olive|olive oil","",900,0,0,100,"fat",0,10,13.5],
    ["Huile végétale","huile|huile tournesol|huile colza|huile arachide|huile coco|huile vegetale|oil","",900,0,0,100,"fat",0,10,13.5],
    ["Beurre","beurre|butter","",753,0.6,0.7,83,"fat",0,10,14],
    ["Beurre de cacahuète","beurre cacahuete|beurre cacahuetes|pate arachide|peanut butter","",643,22.2,17.3,51.4,"fat",0,20,16],
    ["Amandes","amande|amandes|almond","",634,21.4,8.8,52.5,"fat",1.2,30,0],
    ["Noix","noix|cerneau noix|walnut","",709,13.3,6.9,67.3,"fat",5,30,0],
    ["Noisettes","noisette|noisettes|hazelnut","",683,13.9,7,63,"fat",1.2,30,0],
    ["Cacahuètes grillées","cacahuete|cacahuetes|arachide|peanut","",623,24.5,14.8,50,"fat",0,30,0],
    ["Noix de cajou","noix cajou|cajou|cashew","",605,18,26,46,"fat",0,30,0],
    ["Graines de chia","chia|graine chia|graines chia","",486,16.5,8,31,"fat",0,15,12],
    ["Avocat","avocat|avocado","",205,1.6,0.8,20.6,"fat",140,70,0],
    ["Houmous","houmous|hummus","",258,8.1,9,19.9,"fat",0,40,20],
    // fruits
    ["Banane","banane|banana","",90,1.1,19.7,0.3,"fruit",120,120,0],
    ["Pomme","pomme|apple","",54,0.3,11.6,0.3,"fruit",150,150,0],
    ["Poire","poire|pear","",57,0.4,12.3,0.3,"fruit",160,160,0],
    ["Orange","orange","",46,0.9,8,0.4,"fruit",150,150,0],
    ["Clémentine","clementine|mandarine","",47,0.8,9.2,0.2,"fruit",60,120,0],
    ["Fraises","fraise|fraises|strawberry","",33,0.7,6,0.3,"fruit",0,150,0],
    ["Raisin","raisin|grape","",70,0.6,16,0.2,"fruit",0,120,0],
    ["Kiwi","kiwi","",61,0.9,11,0.6,"fruit",75,75,0],
    ["Myrtilles","myrtille|myrtilles|blueberry","",58,0.9,10.6,0.3,"fruit",0,100,0],
    ["Mangue","mangue|mango","",64,0.7,13.5,0.3,"fruit",0,150,0],
    ["Ananas","ananas|pineapple","",53,0.5,11.7,0.2,"fruit",0,150,0],
    ["Dattes","datte|dattes|date","",287,1.8,65,0.4,"fruit",8,24,0],
    ["Raisins secs","raisin sec|raisins secs","",322,3,73.2,0.9,"fruit",0,25,10],
    ["Compote de pomme sans sucre ajouté","compote|compote pomme|applesauce","",67,0.3,15,0.2,"fruit",100,100,20],
    ["Jus d'orange","jus orange|orange juice|jus fruit","",44,0.7,9.6,0.1,"fruit",0,200,15],
    // légumes
    ["Tomate","tomate|tomates|tomato|tomate cerise","",19,0.9,2.5,0.3,"veg",120,120,0],
    ["Concombre","concombre|cucumber","",14,0.6,2,0.1,"veg",0,100,0],
    ["Carotte","carotte|carottes|carrot","",36,0.8,6.6,0.3,"veg",80,100,0],
    ["Courgette","courgette|zucchini","",17,1.2,1.8,0.3,"veg",0,150,0],
    ["Brocoli","brocoli|broccoli","",30,2.9,2.2,0.4,"veg",0,150,0],
    ["Haricots verts","haricot vert|haricots verts|green bean","",30,2,3,0.2,"veg",0,150,0],
    ["Épinards","epinard|epinards|spinach","",23,2.9,1.4,0.4,"veg",0,100,0],
    ["Poivron","poivron|bell pepper","",26,0.9,4.6,0.3,"veg",150,100,0],
    ["Oignon","oignon|onion|echalote","",39,1.1,6.3,0.6,"veg",100,50,0],
    ["Champignons","champignon|champignons|mushroom","",22,2.6,1.6,0.3,"veg",0,100,0],
    ["Salade verte","salade|laitue|salade verte|mache|roquette|lettuce","",15,1.4,1.2,0.2,"veg",0,50,0],
    ["Chou-fleur","chou fleur|cauliflower","",25,1.8,2.1,0.7,"veg",0,150,0],
    ["Aubergine","aubergine|eggplant","",33,1.2,4.2,0.3,"veg",0,150,0],
    ["Maïs doux égoutté","mais|mais doux|sweetcorn|corn","",103,2.9,17.7,1.8,"veg",0,70,0],
    ["Petits pois","petit pois|petits pois|pea","",73,5.8,9.5,0.6,"veg",0,120,0],
    ["Poireau","poireau|leek","",30,1.5,4.6,0.3,"veg",0,150,0],
    ["Potiron","potiron|courge|butternut|potimarron|pumpkin","",26,1,4.5,0.1,"veg",0,200,0],
    ["Betterave cuite","betterave|beetroot","",47,1.8,8.6,0.2,"veg",0,100,0],
    ["Légumes variés","legume|legumes|poelee legumes|crudite|crudites|vegetable","",40,2,6,0.6,"veg",0,150,0],
    // sauces, condiments, sucré
    ["Ketchup","ketchup","",108,1.2,23.7,0.2,"sauce",0,15,15],
    ["Mayonnaise","mayonnaise|mayo","",690,1.2,2,75,"sauce",0,15,15],
    ["Moutarde","moutarde|mustard","",151,6.9,4.3,11.2,"sauce",0,10,15],
    ["Sauce soja","sauce soja|soy sauce","",62,7.7,6.4,0.1,"sauce",0,10,15],
    ["Sauce tomate","sauce tomate|coulis tomate|passata|tomato sauce","",55,1.6,8,1.5,"sauce",0,100,15],
    ["Pesto","pesto","",480,5,5,48,"sauce",0,20,15],
    ["Vinaigrette","vinaigrette|dressing","",460,0.3,4,49,"sauce",0,15,12],
    ["Sauce barbecue","sauce barbecue|barbecue|bbq","",136,0.6,30.3,0.6,"sauce",0,20,17],
    ["Sauce blanche","sauce blanche|sauce yaourt|sauce kebab|sauce ail","",250,2,6,24,"sauce",0,25,15],
    ["Miel","miel|honey","",331,0.7,82.1,0,"sweet",0,15,21],
    ["Sucre","sucre|sugar","",399,0,99.7,0,"sweet",5,5,12],
    ["Confiture","confiture|jam","",247,0.4,60,0.1,"sweet",0,20,20],
    ["Sirop d'érable","sirop erable|maple syrup","",269,0,67.2,0.1,"sweet",0,15,20],
    ["Chocolat noir 70 %","chocolat|chocolat noir|dark chocolate","",572,9.4,32.9,42,"sweet",5,20,0],
    ["Pâte à tartiner","pate tartiner|nutella","",539,5.4,57.3,31.6,"sweet",0,15,15],
    // divers
    ["Pizza","pizza","",234,10,27.4,8.9,"other",0,300,0],
    ["Croissant","croissant","",420,7.5,43,24,"other",60,60,0],
    ["Pain au chocolat","pain chocolat|chocolatine","",423,7.5,45.4,22.5,"other",70,70,0],
    ["Soda sucré","soda|coca|cola|limonade","",42,0,10.5,0,"other",330,330,0],
    ["Café ou thé sans sucre","cafe|the|expresso|coffee|tea|eau","",1,0.1,0,0,"other",0,150,0],
  ];
  const fold=s=>String(s==null?"":s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/œ/g,"oe").replace(/Œ/g,"oe").toLowerCase();
  const STOP=new Set(["de","d","du","des","la","le","les","l","au","aux","a","en","un","une","et","mon","ma","mes","ce","cette","sans","peau","of","some","nature","bio","maison","petit","petite","gros","grosse","mg","pour","surgele","surgelee","egoutte","egouttee","sale","doux"]);
  const RAW=/^(cru|crue|crus|crues|sec|seche|secs|seches|raw|dry|uncooked)$/,COOKED=/^(cuit|cuite|cuits|cuites|cooked|bouilli|bouillie|bouillis|bouillies|grille|grillee|grilles|grillees|poele|poelee|poeles|poelees|roti|rotie|rotis|roties|saute|sautee|sautes|sautees|frit|frits|boiled|grilled|roasted|baked|fried|steamed)$/;
  const METHOD=[["four",/^(four|oven|baked|roti|rotie|rotis|roties|roasted)$/],["friteuse",/^(friteuse|frit|frits|fried|airfryer)$/],["vapeur",/^(vapeur|steamed)$/],["poele",/^(poele|poelee|poeles|poelees|saute|sautee|grille|grillee|grilled|plancha)$/],["eau",/^(bouilli|bouillie|bouillis|bouillies|boiled)$/]];
  const sing=t=>t.length>3&&/[sx]$/.test(t)&&!/(ss|us|is|as|os)$/.test(t)?t.slice(0,-1):t;
  // analyse("Frites au four crues") → {tokens:["frite"], state:"r", method:"four"} : mots utiles au singulier, état et cuisson lus à part ; « 5 % » devient le jeton « 5 »
  function analyse(text){
    // « jambon cru » et « raisins secs » sont des aliments à part entière, pas un état de pesée
    const words=fold(text).replace(/jambons? (?:cru|sec)s?/g,"jambonsec").replace(/raisins? secs?/g,"raisinsec").replace(/(\d+)\s*%/g," $1 ").replace(/['’`]/g," ").replace(/[^a-z0-9 ]+/g," ").split(/\s+/).filter(Boolean);
    let raw=false,cooked=false,method="";const tokens=[];
    for(const w of words){
      if(RAW.test(w)){raw=true;continue}
      const m=METHOD.find(x=>x[1].test(w));if(m)method=method||m[0];
      if(COOKED.test(w)){cooked=true;continue}
      if(m)continue;
      const t=sing(w);if(STOP.has(w)||STOP.has(t))continue;tokens.push(t)}
    return {tokens,state:raw?"r":cooked?"c":"",method};
  }
  const INDEX=ROWS.map((r,i)=>({i,name:r[0],state:r[2],n:[r[3],r[4],r[5],r[6]],role:r[7],unit:r[8],portion:r[9],spoon:r[10],
    alias:[...new Set(r[1].split("|").concat([r[0]]).map(a=>analyse(a).tokens.sort().join(" ")).filter(Boolean))],rowMethod:analyse(r[0]).method}));
  // find(name, {prefer:"raw"|"cooked"}) → fiche ou null. Tous les mots utiles de la demande doivent être couverts par un alias (sinon : estimation du modèle).
  function find(name,opt={}){
    const q=analyse(name);if(!q.tokens.length)return null;const key=[...new Set(q.tokens)].sort().join(" ");
    const want=q.state||(opt.prefer==="raw"?"r":opt.prefer==="cooked"?"c":""),explicit=!!q.state;
    let best=null,score=-1;
    for(const e of INDEX){if(!e.alias.includes(key))continue;
      if(explicit&&e.state&&e.state!==q.state)continue;
      let s=0;if(e.state===want)s+=4;else if(!e.state)s+=3;else if(!want&&e.state==="c")s+=1;
      if(q.method&&e.rowMethod===q.method)s+=2;else if(q.method&&e.rowMethod)s-=1;else if(!q.method&&e.rowMethod)s-=1;
      if(s>score){score=s;best=e}}
    if(!best)return null;
    return {name:best.name,state:best.state==="r"?"raw":best.state==="c"?"cooked":"unspecified",kcal:best.n[0],p:best.n[1],c:best.n[2],f:best.n[3],role:best.role,unit_g:best.unit,portion_g:best.portion,spoon_g:best.spoon,
      assumed_state:!!best.state&&!explicit,method:q.method||""};
  }
  const r1=v=>Math.round(v*10)/10;
  // compute(fiche, g) → valeurs pour la quantité (kcal entier, macros au dixième)
  function compute(e,g){return {kcal:Math.round(e.kcal*g/100),p:r1(e.p*g/100),c:r1(e.c*g/100),f:r1(e.f*g/100)}}
  const NUM={un:1,une:1,deux:2,trois:3,quatre:4,cinq:5,six:6,sept:7,huit:8,dix:10,demi:.5,demie:.5,a:1,an:1,one:1,two:2,three:3,four:4,half:.5};
  const LEAD=/^(?:.*?\b(?:j ai|je viens de|on a|i|i ve|i have|we)\s+(?:mange|pris|bu|avale|consomme|eu|pese|ate|had|drank|eaten|weighed)\b|(?:note|ajoute|enregistre|log|add)(?:\s+(?:moi|me))?\b)\s*/;
  const TAIL=/\s+(?:ce matin|ce midi|ce soir|hier soir|hier|aujourd hui|au petit dejeuner|au dejeuner|au diner|au gouter|a midi|pour le diner|pour le dejeuner|this morning|today|tonight|for lunch|for dinner|for breakfast)\s*$/;
  // parseFoodText("j'ai mangé 50 g de flocons d'avoine et 2 œufs", {prefer}) → {statement, items:[…], unknown:[…]}
  // statement : la phrase annonce un repas pris (« j'ai mangé… ») ou n'est qu'une liste quantité + aliment.
  function parseFoodText(text,opt={}){
    let s=" "+fold(text).replace(/['’`]/g," ").replace(/(\d),(\d)/g,"$1.$2").replace(/[.!?;:]+(\s|$)/g," $1").replace(/\s+/g," ").trim();
    s=s.trim();const lead=LEAD.test(s);if(lead)s=s.replace(LEAD,"");s=s.replace(TAIL,"").trim();
    if(!s)return {statement:false,items:[],unknown:[]};
    const parts=s.split(/\s*(?:,|\+|\bet\b|\band\b|\bavec\b|\bwith\b|\bpuis\b)\s*/).map(x=>x.trim()).filter(Boolean);
    const items=[],unknown=[];let allQty=true;
    for(const part of parts){
      let m=part.match(/^(\d+(?:\.\d+)?)\s*(kg|kilo|kilos|g|gr|grammes?|grams?|ml|cl|l|litres?|cas|cs|cac|cc|c a s(?:oupe)?|c a c(?:afe)?|cuilleres? a soupe|cuilleres? a cafe|tbsp|tsp|tranches?|slices?|portions?|bols?|verres?|tasses?|poignees?|pieces?|x)?(?![a-z0-9])\s*(?:de |d |of )?(.+)$/),n=null,unit="",food=part;
      const end=m?null:part.match(/^(.+?)\s+(\d+(?:\.\d+)?)\s*(kg|g|gr|grammes?|grams?|ml|cl|l)$/); // « lait entier 250 ml »
      if(end){n=+end[2];unit=end[3];food=end[1]}
      else if(m){n=+m[1];unit=m[2]||"";food=m[3]}
      else{const w=part.match(/^(un|une|deux|trois|quatre|cinq|six|sept|huit|dix|demi|demie|a|an|one|two|three|four|half)\s+(?:(tranches?|slices?|portions?|bols?|verres?|tasses?|poignees?|cuilleres? a soupe|cuilleres? a cafe|c a s|c a c)\s+)?(?:de |d |of )?(.+)$/);
        if(w){n=NUM[w[1]];unit=w[2]||"";food=w[3]}else{food=part.replace(/^(?:du|de la|de l|des|de|d|some)\s+/,"");allQty=false}}
      const e=find(food,opt);
      if(!e){unknown.push({text:part,name:food,...(n&&/^(kg|kilo|kilos|g|gr|gramme|grammes|gram|grams)$/.test(unit)?{g:/^k/.test(unit)?n*1000:n}:{})});continue}
      let g,assumed=false,qty;
      if(n==null){g=e.portion_g;assumed=true;qty=g+" g"}
      else if(/^(kg|kilo|kilos)$/.test(unit)){g=n*1000;qty=g+" g"}
      else if(/^(g|gr|grammes?|grams?)$/.test(unit)){g=n;qty=g+" g"}
      else if(/^(ml)$/.test(unit)){g=n;qty=n+" ml"}
      else if(unit==="cl"){g=n*10;qty=n+" cl"}
      else if(/^(l|litres?)$/.test(unit)){g=n*1000;qty=n+" l"}
      else if(/^(cas|cs|c a s|cuilleres? a soupe|tbsp)/.test(unit)){g=n*(e.spoon_g||15);qty=n+" c. à soupe"}
      else if(/^(cac|cc|c a c|cuilleres? a cafe|tsp)/.test(unit)){g=n*(e.spoon_g||15)/3;qty=n+" c. à café"}
      else if(/^(bols?|verres?|tasses?|portions?|poignees?)$/.test(unit)){g=n*e.portion_g;assumed=true;qty=n+" "+unit}
      else if(e.unit_g){g=n*e.unit_g;qty=unit&&unit!=="x"?n+" "+unit:String(n)}
      else{g=n*e.portion_g;assumed=true;qty=unit&&unit!=="x"?n+" "+unit:String(n)}
      g=Math.round(g*10)/10;if(!(g>0)||g>5000){unknown.push({text:part,name:food});continue}
      items.push({name:e.name,qty,g,...compute(e,g),weight_state:e.state,source:"table",...(e.unit_g&&n!=null&&g===Math.round(n*e.unit_g*10)/10?{unit_g:e.unit_g}:{}),...(assumed?{assumed_qty:true}:{}),...(e.assumed_state?{assumed_state:true}:{})});
    }
    return {statement:lead||(allQty&&items.length>0&&!unknown.length),items,unknown};
  }
  // recalc(items, {prefer}) → mêmes ingrédients, valeurs recalculées depuis la table quand l'aliment y est ; sinon valeurs fournies, marquées estimated.
  function recalcItem(x,opt={}){
    const g=typeof x.g==="number"?x.g:typeof x.grams==="number"?x.grams:0;
    const prefer=x.weight_state==="raw"||x.weight_state==="cooked"?x.weight_state:opt.prefer;
    const e=g>0?find(x.name||x.food||"",{prefer}):null;
    if(!e||x.weight_state==="raw"&&e.state==="cooked"||x.weight_state==="cooked"&&e.state==="raw")return {...x,...(x.source==="table"?{}:{estimated:true})};
    const out={...x,...compute(e,g),weight_state:e.state,source:"table",role:e.role};delete out.estimated;
    if(e.unit_g&&Math.abs(g/e.unit_g-Math.round(g/e.unit_g))<.03&&g>=e.unit_g*.97)out.unit_g=e.unit_g; // pièces entières (wrap, œuf) : jamais ajustées au gramme
    if(e.state!=="unspecified")out.name=e.name; // le nom de la fiche dit toujours « cru » ou « cuit »
    return out;
  }
  const total=items=>({kcal:Math.round(items.reduce((t,x)=>t+(+x.kcal||0),0)),p:r1(items.reduce((t,x)=>t+(+x.p||0),0)),c:r1(items.reduce((t,x)=>t+(+x.c||0),0)),f:r1(items.reduce((t,x)=>t+(+x.f||0),0))});
  // fit(items, target) → ajuste les grammages (féculent et protéine ensemble, puis le féculent seul, puis le reste) pour viser la cible ; pas de 5 g ; pièces entières gardées.
  // Renvoie {items, kcal, ok} ; ok = écart ≤ tol (5 % par défaut). Les bornes évitent une assiette absurde : au-delà, il faut redemander un menu.
  function fit(items,target,tol=.05){
    const out=items.map(x=>({...x})),sum=()=>out.reduce((t,x)=>t+x.kcal,0),within=()=>Math.abs(sum()-target)<=Math.max(10,target*tol);
    const scale=(x,g)=>{const k=g/x.g;x.kcal=Math.round(x.kcal*k);for(const m of ["p","c","f"])x[m]=r1(x[m]*k);x.g=g;x.qty=g+" g"};
    const step=(roles,lo,hi)=>{
      const pool=out.filter(x=>roles(x)&&x.g>0&&x.kcal>0&&!x.unit_g);if(!pool.length)return;
      const base=pool.reduce((t,x)=>t+x.kcal,0),want=base+(target-sum()),k=Math.min(hi,Math.max(lo,want/base));
      for(const x of pool){const g=Math.max(5,Math.round(x.g*k/5)*5);if(g!==x.g)scale(x,g)}
      // dernier réglage fin sur l'ingrédient le plus calorique du groupe (pas de 5 g)
      const main=pool.sort((a,b)=>b.kcal-a.kcal)[0],per=main.kcal/main.g,d=Math.round((target-sum())/per/5)*5,g=main.g+d;
      if(d&&g>=5&&g>=main.g0*lo&&g<=main.g0*hi)scale(main,g)};
    for(const x of out)x.g0=x.g;
    if(Math.abs(sum()-target)>Math.max(5,target*.015)){
      step(x=>x.role==="starch"||x.role==="protein",.6,1.6);
      if(!within())step(x=>x.role==="starch",.5,1.8);
      if(!within())step(x=>x.role!=="starch"&&x.role!=="protein",.5,1.6);
      if(!within())step(()=>true,.8,1.25)}
    for(const x of out)delete x.g0;
    return {items:out,kcal:Math.round(sum()),ok:within()};
  }
  const dec=(v,en)=>en?String(v):String(v).replace(".",",");
  // mealText(items, locale) → « Total : … » puis les hypothèses (estimé, portion standard, état de pesée) puis « Je l'enregistre ? »
  function mealText(items,locale="fr"){
    const en=locale==="en",t=total(items),out=[en?`Total: ${t.kcal} kcal · P ${t.p} g · C ${t.c} g · F ${t.f} g`:`Total : ${t.kcal} kcal · P ${dec(t.p)} g · G ${dec(t.c)} g · L ${dec(t.f)} g`];
    const est=items.filter(x=>x.estimated).map(x=>x.name),qty=items.filter(x=>x.assumed_qty).map(x=>`${x.name} (${dec(x.g,en)} g)`),st=items.filter(x=>x.assumed_state).map(x=>x.name);
    if(est.length)out.push((en?"Estimated: ":"Estimé : ")+est.join(", ")+".");
    if(qty.length)out.push((en?"Quantity not given, standard portion used: ":"Quantité non précisée, portion standard retenue : ")+qty.join(", ")+".");
    if(st.length)out.push((en?"Cooking state not given, counted as: ":"État de pesée non précisé, compté comme : ")+st.join(", ")+".");
    out.push(en?"Shall I save it?":"Je l'enregistre ?");return out.join("\n");
  }
  const strip=items=>items.map(({assumed_state,assumed_qty,role,...x})=>x);
  // mealProposal("j'ai mangé 50 g de flocons d'avoine", {date, locale, prefer}) → {reply, actions:[log_meal]} quand TOUT est dans la table, sinon null (le modèle estime).
  function mealProposal(text,opt={}){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(opt.date||"")||String(text).length>600)return null;
    const r=parseFoodText(text,{prefer:opt.prefer||"cooked"});if(!r.statement||r.unknown.length||!r.items.length)return null;
    const items=strip(r.items),name=items.map(x=>x.name).join(", ").slice(0,300);
    return {reply:mealText(r.items,opt.locale),actions:[{type:"log_meal",label:`${name} · ${total(items).kcal} kcal`.slice(0,120),payload:{date:opt.date,name,items}}]};
  }
  return {rows:ROWS,fold,analyse,find,compute,parseFoodText,recalcItem,total,fit,mealText,mealProposal,strip};
}

const nutritionTable=createNutritionTable();
