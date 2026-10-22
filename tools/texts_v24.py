# -*- coding: utf-8 -*-
"""Новые тексты и строки интерфейса для таблицы v2.4 (точки 4–8). Написано 22.10.2026 (П-016, Fable).
Только проверенные факты из СВЕРОК П-014/П-015 и Чувашской энциклопедии (chuvenc.ru). Переводы — черновик Claude,
вычитка носителем обязательна (как у остальных текстов таблицы)."""

L = ['ru-RU', 'en-GB', 'en-US', 'de-DE', 'fr-FR', 'zh-Hans', 'hi-IN', 'tr-TR']

def us(gb):
    """en-US из en-GB: кавычки и несколько написаний"""
    s = gb.replace('‘', '“').replace('’', '”')
    for a, b in [('metres', 'meters'), ('metre', 'meter'), ('centre', 'center'), ('neighbour', 'neighbor'),
                 ('organised', 'organized'), ('recognise', 'recognize'), ('realise', 'realize'), ('colour', 'color'),
                 ('honour', 'honor'), ('favour', 'favor'), ('programme', 'program'), ('storey', 'story'),
                 ('two-storey', 'two-story'), ('mould', 'mold'), ('grey', 'gray'), ('licence', 'license')]:
        s = s.replace(a, b)
    return s

TEXTS = {}

# ============================================================== T06 — точка 4, Ефремовы
TEXTS['T06_EFREMOV_NARR'] = {
    'point': '4 · Дом купца Ефремова',
    'who': 'Сетнер — рассказчик (голос нашего времени, источник на экране)',
    'voice': 'РАССКАЗЧИК', 'layer': 'НАУКА',
    'source': 'Чувашская энциклопедия (chuvenc.ru): ст. «Ефремовы» (В.В. Орлов) — https://chuvenc.ru/show_MainTable/150329; '
              'ст. «Усыпальница Ефремовых» (Н.И. Муратов) — https://chuvenc.ru/show_MainTable/150073. '
              'Библиография ЧЭ: Орлов В.В. П.Е. Ефремов: легенды и действительность. Ч., 1997',
    'status': 'ЧЕРНОВИК 22.10.2026 (П-016) — текст на фактах энциклопедии; вычитка владельцем',
    'check': 'Все цифры — из статьи ЧЭ «Ефремовы». Перед записью голоса — вычитка владельцем; переводы — носителями.',
    'ru-RU':
        'Этот квартал построила одна семья. Основатель — Ефрем Ефимов, государственный крестьянин из деревни Шинерпоси: '
        'начинал с кустарного промысла и хлебной торговли, а в сороковые годы девятнадцатого века вместе с сыном '
        'Прокопием перебрался в Чебоксары и основал торговую фирму.\n'
        'Прокопий Ефремов прошёл путь от крестьянина со свидетельством на торговлю до купца первой гильдии. Муку '
        'Ефремовы продавали в Петербурге, Нижнем Новгороде и Рыбинске; держали три самые мощные мельницы в уезде и '
        'самую большую в городе кулеткацкую мастерскую — тридцать взрослых и шестьдесят подростков делали до тридцати '
        'тысяч кулей в год. В 1890 году братья открыли лесопильный завод, а в 1906-м — торговый дом «П. Е. Ефремов с '
        'сыновьями». Общий оборот доходил до полумиллиона рублей в год.\n'
        'На их деньги в годы русско-японской войны работала бесплатная столовая, открылся приют для сирот, было куплено '
        'здание для женской прогимназии, содержалась городская библиотека. Сын Фёдор был городским головой в 1914–1917 '
        'годах, сын Николай — депутатом Государственной думы. Между их домами стояли склады, лавки, сады, теплицы и '
        'оранжереи. Сегодня в особняках Ефремовых — Чувашский национальный музей и Отдел русского искусства '
        'художественного музея.',
    'en-GB':
        'This whole block was built by one family. Its founder, Yefrem Yefimov, was a state peasant from the village of '
        'Shinerposi: he began with a cottage trade and grain dealing, and in the 1840s moved to Cheboksary with his son '
        'Prokopy and set up a trading firm.\n'
        'Prokopy Yefremov rose from a peasant with a trading licence to a merchant of the first guild. The Yefremovs '
        'sold flour in St Petersburg, Nizhny Novgorod and Rybinsk; they owned the three most powerful mills in the '
        'district and the largest bast-sack workshop in town — thirty adults and sixty youngsters made up to thirty '
        'thousand sacks a year. In 1890 the brothers opened a sawmill, and in 1906 the trading house ‘P. Ye. Yefremov '
        'and Sons’. Their total turnover reached half a million roubles a year.\n'
        'Their money ran a free canteen during the Russo-Japanese War, opened an orphanage, bought the building for the '
        'girls’ pro-gymnasium and kept the town library going. Their son Fyodor was mayor in 1914–1917; their son Nikolai '
        'sat in the State Duma. Between their houses stood warehouses, shops, gardens, hothouses and orangeries. Today '
        'the Yefremov mansions house the Chuvash National Museum and the Russian Art Department of the Art Museum.',
    'de-DE':
        'Dieses ganze Viertel hat eine einzige Familie gebaut. Der Gründer, Jefrem Jefimow, war ein Staatsbauer aus dem '
        'Dorf Schinerposi: Er begann mit Heimgewerbe und Getreidehandel, zog in den 1840er-Jahren mit seinem Sohn Prokopi '
        'nach Tscheboksary und gründete eine Handelsfirma.\n'
        'Prokopi Jefremow stieg vom Bauern mit Handelsschein zum Kaufmann erster Gilde auf. Mehl verkauften die Jefremows '
        'in Sankt Petersburg, Nischni Nowgorod und Rybinsk; sie besaßen die drei stärksten Mühlen des Kreises und die '
        'größte Bastsack-Werkstatt der Stadt – dreißig Erwachsene und sechzig Jugendliche fertigten bis zu dreißigtausend '
        'Säcke im Jahr. 1890 eröffneten die Brüder ein Sägewerk, 1906 das Handelshaus „P. J. Jefremow und Söhne“. Der '
        'Gesamtumsatz erreichte eine halbe Million Rubel im Jahr.\n'
        'Mit ihrem Geld lief im Russisch-Japanischen Krieg eine kostenlose Suppenküche, ein Waisenhaus wurde eröffnet, '
        'das Gebäude für das Mädchen-Progymnasium gekauft und die Stadtbibliothek unterhalten. Sohn Fjodor war 1914–1917 '
        'Stadtoberhaupt, Sohn Nikolai saß in der Staatsduma. Zwischen ihren Häusern standen Lager, Läden, Gärten, '
        'Gewächshäuser und Orangerien. Heute beherbergen die Jefremow-Villen das Tschuwaschische Nationalmuseum und die '
        'Abteilung für russische Kunst des Kunstmuseums.',
    'fr-FR':
        'Tout ce quartier a été bâti par une seule famille. Son fondateur, Efrem Efimov, paysan d’État du village de '
        'Chinerpossi, commença par l’artisanat et le commerce du grain, puis, dans les années 1840, s’installa à Tcheboksary '
        'avec son fils Prokopi et fonda une maison de commerce.\n'
        'Prokopi Efremov passa de paysan muni d’une patente à marchand de première guilde. Les Efremov vendaient leur farine '
        'à Saint-Pétersbourg, Nijni Novgorod et Rybinsk ; ils possédaient les trois moulins les plus puissants du district '
        'et le plus grand atelier de sacs de tille de la ville — trente adultes et soixante adolescents y fabriquaient '
        'jusqu’à trente mille sacs par an. En 1890, les frères ouvrirent une scierie, et en 1906 la maison de commerce '
        '« P. E. Efremov et fils ». Le chiffre d’affaires atteignait un demi-million de roubles par an.\n'
        'Avec leur argent, une cantine gratuite fonctionna pendant la guerre russo-japonaise, un orphelinat ouvrit, le '
        'bâtiment du pro-gymnase de jeunes filles fut acheté et la bibliothèque municipale entretenue. Le fils Fiodor fut '
        'maire de 1914 à 1917, le fils Nikolaï siégea à la Douma d’État. Entre leurs maisons s’alignaient entrepôts, '
        'boutiques, jardins, serres et orangeries. Aujourd’hui, les hôtels particuliers des Efremov abritent le Musée '
        'national tchouvache et le département d’art russe du Musée des beaux-arts.',
    'zh-Hans':
        '这整个街区是由一个家族建起来的。创始人叶夫列姆·叶菲莫夫是希涅尔波西村的国家农民：他从家庭手工业和粮食买卖起步，'
        '十九世纪四十年代带着儿子普罗科皮迁到切博克萨雷，创办了商行。\n'
        '普罗科皮·叶夫列莫夫从持有经商执照的农民一路做到一等行会商人。叶夫列莫夫家把面粉卖到圣彼得堡、下诺夫哥罗德和雷宾斯克；'
        '他们拥有本县最强的三座磨坊，以及城里最大的麻袋作坊——三十名成人和六十名少年每年织出多达三万条麻袋。1890年兄弟俩开办了锯木厂，'
        '1906年成立了“П. Е. 叶夫列莫夫父子”商号。年营业额高达五十万卢布。\n'
        '他们出钱，在日俄战争期间开办免费食堂，建起孤儿院，为女子预科中学购买校舍，并维持着市立图书馆。儿子费奥多尔在1914至1917年'
        '任市长，儿子尼古拉是国家杜马议员。他们的宅邸之间是仓库、店铺、花园、温室和暖房。如今叶夫列莫夫家的府邸里是楚瓦什国家博物馆'
        '和美术馆的俄罗斯艺术部。',
    'hi-IN':
        'यह पूरा मोहल्ला एक ही परिवार ने बनाया था। इसके संस्थापक येफ़्रेम येफ़िमोव शिनेरपोसी गाँव के राजकीय किसान थे: उन्होंने घरेलू शिल्प और अनाज के '
        'व्यापार से शुरुआत की, और उन्नीसवीं सदी के चालीसवें दशक में बेटे प्रोकोपी के साथ चेबोक्सारी आकर व्यापारिक फ़र्म खोली।\n'
        'प्रोकोपी येफ़्रेमोव व्यापार-परमिट वाले किसान से पहली श्रेणी के व्यापारी बने। येफ़्रेमोव परिवार आटा सेंट पीटर्सबर्ग, निज़नी नोवगोरोद और रिबिंस्क में '
        'बेचता था; उनके पास ज़िले की तीन सबसे शक्तिशाली चक्कियाँ और शहर की सबसे बड़ी बोरी बुनने की कार्यशाला थी — तीस वयस्क और साठ किशोर साल में '
        'तीस हज़ार तक बोरियाँ बनाते थे। 1890 में भाइयों ने आरा-मिल खोली, और 1906 में व्यापारिक घराना «पी. ये. येफ़्रेमोव और पुत्र»। कुल कारोबार साल में '
        'आधा मिलियन रूबल तक पहुँचता था।\n'
        'उनके पैसे से रूस-जापान युद्ध के वर्षों में मुफ़्त भोजनालय चला, अनाथालय खुला, लड़कियों के प्रो-जिम्नेज़ियम के लिए इमारत ख़रीदी गई और नगर '
        'पुस्तकालय चलता रहा। बेटे फ़्योदोर 1914–1917 में नगर प्रमुख रहे, बेटे निकोलाई राज्य ड्यूमा के सदस्य। उनके घरों के बीच गोदाम, दुकानें, बाग़, '
        'ग्रीनहाउस और ऑरेंजरी थीं। आज येफ़्रेमोव हवेलियों में चुवाश राष्ट्रीय संग्रहालय और कला संग्रहालय का रूसी कला विभाग है।',
    'tr-TR':
        'Bu mahallenin tamamını tek bir aile kurdu. Kurucusu Yefrem Yefimov, Şinerposi köyünden bir devlet köylüsüydü: ev '
        'zanaatı ve tahıl ticaretiyle başladı, on dokuzuncu yüzyılın kırklı yıllarında oğlu Prokopiy ile Çeboksarı’ya '
        'taşınıp bir ticaret firması kurdu.\n'
        'Prokopiy Yefremov, ticaret belgeli bir köylüden birinci lonca tüccarlığına yükseldi. Yefremovlar unu Petersburg, '
        'Nijniy Novgorod ve Rıbinsk’te satıyordu; ilçenin en güçlü üç değirmenine ve şehrin en büyük çuval atölyesine '
        'sahiptiler — otuz yetişkin ve altmış genç yılda otuz bin çuval dokuyordu. 1890’da kardeşler bir kereste fabrikası, '
        '1906’da “P. Ye. Yefremov ve Oğulları” ticarethanesini açtı. Toplam ciro yılda yarım milyon rubleye ulaşıyordu.\n'
        'Onların parasıyla Rus-Japon Savaşı yıllarında ücretsiz bir aşevi çalıştı, bir yetimhane açıldı, kız '
        'pro-gimnazyumu için bina satın alındı ve şehir kütüphanesi ayakta tutuldu. Oğul Fyodor 1914–1917’de belediye '
        'başkanıydı, oğul Nikolay Devlet Duması üyesi. Evlerinin arasında depolar, dükkânlar, bahçeler, seralar ve '
        'limonluklar vardı. Bugün Yefremov konaklarında Çuvaş Ulusal Müzesi ile Sanat Müzesi’nin Rus Sanatı Bölümü '
        'bulunuyor.',
}

# ============================================================== T07 — точка 5, доклад фон Бранта (ДОКУМЕНТ, персонаж)
TEXTS['T07_FONBRANT'] = {
    'point': '5 · Хлебные амбары',
    'who': 'Фон Брант, казанский губернатор — читает свой доклад в Сенат о пожаре 1773 года',
    'voice': 'ПЕРСОНАЖ', 'layer': 'ДОКУМЕНТ',
    'source': 'Доклад казанского губернатора Фон Бранта в Сенат, 1773 — цитируется по методическому занятию 9 «Тайны '
              'древнего кремля» (gov.cap.ru/Content2020/orgs/GovId_911/zanyatie_9.pdf). Текст — три фрагмента доклада, '
              'соединённые многоточиями; первоисточник не найден (ГИА ЧР / РГАДА)',
    'status': 'СНАЧАЛА СВЕРКА (как T03): фрагменты по методичке, первоисточник доклада не найден',
    'check': 'Найти публикацию доклада Фон Бранта (ГИА ЧР, РГАДА или сборник документов); до этого голос не записывать.',
    'ru-RU':
        '«Апреля 30 числа в городе Чебоксарах был пожар, в котором сгорело церквей 29, обывательских домов 717… '
        'кладовых на пристанях, амбаров с хлебными и другими припасами 49… торговых лавок с мелочными товарами 38».',
    'en-GB':
        '‘On the 30th day of April there was a fire in the town of Cheboksary, in which there burned 29 churches, '
        '717 townspeople’s houses… storehouses on the wharves, barns with grain and other provisions — 49… trading '
        'stalls with sundry goods — 38.’',
    'de-DE':
        '„Am 30. April kam es in der Stadt Tscheboksary zu einem Brand, bei dem 29 Kirchen und 717 Bürgerhäuser '
        'verbrannten … Vorratshäuser an den Anlegestellen, Speicher mit Getreide und anderen Vorräten – 49 … '
        'Handelsbuden mit Kleinwaren – 38.“',
    'fr-FR':
        '« Le 30 avril, dans la ville de Tcheboksary, un incendie a détruit 29 églises, 717 maisons d’habitants… '
        'des entrepôts sur les quais, des granges à grain et autres provisions — 49… des échoppes de menues '
        'marchandises — 38. »',
    'zh-Hans':
        '“四月三十日，切博克萨雷城发生大火，烧毁教堂29座、居民房屋717栋……码头上的库房、存放粮食及其他物资的仓房49座……'
        '经营杂货的商铺38间。”',
    'hi-IN':
        '«अप्रैल की 30 तारीख़ को चेबोक्सारी नगर में आग लगी, जिसमें 29 गिरजाघर, नगरवासियों के 717 घर जल गए… घाटों पर '
        'भंडारगृह, अनाज और अन्य रसद के गोदाम — 49… फुटकर माल की दुकानें — 38।»',
    'tr-TR':
        '“Nisan ayının 30’unda Çeboksarı şehrinde bir yangın çıktı; yangında 29 kilise, 717 kasaba evi yandı… '
        'iskelelerdeki depolar, tahıl ve başka erzak dolu ambarlar — 49… ufak tefek mal satan dükkânlar — 38.”',
}

# ============================================================== T08 — точка 5, амбары (Сетнер)
TEXTS['T08_AMBARY_NARR'] = {
    'point': '5 · Хлебные амбары',
    'who': 'Сетнер — рассказчик (голос нашего времени, источник на экране)',
    'voice': 'РАССКАЗЧИК', 'layer': 'НАУКА',
    'source': 'Перепечатка научной монографии на workshome.ru, страницы «Торговля» и «Пристань на Волге» (архивные копии '
              'web.archive.org 20241212161218, 20250209104612) — вторичный источник, книгу установить в НБ ЧР; '
              'пожар 1773 — доклад Фон Бранта по методичке «Тайны древнего кремля», занятие 9 (gov.cap.ru). См. СВЕРКА_Точка5 (П-015)',
    'status': 'ЧЕРНОВИК 22.10.2026 (П-016) — вторичный источник; вычитка владельцем',
    'check': 'Установить книгу-первоисточник workshome.ru (НБ ЧР) и переподтвердить цифры 55 / 30 / 120 тыс. четв. / 65% / 1833.',
    'ru-RU':
        'Здесь, у воды, стояло богатство города — хлебные амбары. В 1743 году их насчитали пятьдесят пять, а в середине '
        'девятнадцатого века около тридцати амбаров на пристани вмещали до ста двадцати тысяч четвертей хлеба. Рожь и '
        'муку в рогожных кулях держали до выгодной цены, потом грузили на расшивы — и вверх по Волге. Ещё в середине '
        'восемнадцатого века две трети чебоксарского хлеба уходило в Петербург: там он стоил в три-четыре раза дороже, '
        'чем здесь.\n'
        'Хлеб делал купцов хитрыми. Цену писали на товаре буквами — свой шифр хранили как великую тайну. Крестьянские '
        'обозы перехватывали на подъездах к городу, чтобы на площади не сложилась честная цена. В 1833 году городничий '
        'Кропоткин приказал забаррикадировать боковые улицы — чтобы обозы шли только мимо караулов.\n'
        'Тридцатого апреля 1773 года пожар унёс двадцать девять церквей и семьсот семнадцать домов. У купцов Клюевых '
        'сгорело товара на три тысячи сто рублей. Сын купца занял денег, снова стал скупать хлеб — и через десять лет в '
        'его обороте было почти тридцать тысяч рублей. Пожар и возрождение — так и жил этот берег.',
    'en-GB':
        'Here by the water stood the town’s wealth — the grain barns. In 1743 fifty-five of them were counted, and by '
        'the mid-nineteenth century some thirty barns on the wharf held up to a hundred and twenty thousand chetverts of '
        'grain. Rye and flour in bast sacks were kept until the price was right, then loaded onto barges — and off up '
        'the Volga. Already in the mid-eighteenth century two thirds of Cheboksary’s grain went to St Petersburg, where '
        'it fetched three to four times the price it did here.\n'
        'Grain made the merchants cunning. Prices were written on goods in letters — each kept his cipher as a great '
        'secret. Peasant carts were intercepted on the roads into town so that no honest price could form on the square. '
        'In 1833 the town governor Kropotkin had the side streets barricaded, so that every cart passed the guards.\n'
        'On 30 April 1773 a fire took twenty-nine churches and seven hundred and seventeen houses. The merchant Klyuyevs '
        'lost goods worth three thousand one hundred roubles. The merchant’s son borrowed money and began buying grain '
        'again — and ten years later nearly thirty thousand roubles were turning over in his hands. Fire and rebirth: that '
        'is how this shore lived.',
    'de-DE':
        'Hier am Wasser stand der Reichtum der Stadt – die Getreidespeicher. 1743 zählte man fünfundfünfzig, und um die '
        'Mitte des neunzehnten Jahrhunderts fassten etwa dreißig Speicher an der Anlegestelle bis zu hundertzwanzigtausend '
        'Tschetwert Getreide. Roggen und Mehl in Bastsäcken lagerten, bis der Preis stimmte, dann kamen sie auf die Kähne '
        '– und wolgaaufwärts. Schon Mitte des achtzehnten Jahrhunderts gingen zwei Drittel des Tscheboksaryer Getreides '
        'nach Sankt Petersburg: Dort kostete es drei- bis viermal so viel wie hier.\n'
        'Das Getreide machte die Kaufleute gerissen. Den Preis schrieb man in Buchstaben auf die Ware – jeder hütete '
        'seine Chiffre wie ein großes Geheimnis. Bauernfuhren fing man vor der Stadt ab, damit sich auf dem Markt kein '
        'ehrlicher Preis bilden konnte. 1833 ließ Stadthauptmann Kropotkin die Seitenstraßen verbarrikadieren, damit '
        'jede Fuhre an den Wachen vorbeimusste.\n'
        'Am 30. April 1773 nahm ein Brand neunundzwanzig Kirchen und siebenhundertsiebzehn Häuser. Den Kaufleuten '
        'Kljujew verbrannten Waren für dreitausendeinhundert Rubel. Der Sohn lieh sich Geld, kaufte wieder Getreide – und '
        'zehn Jahre später setzte er fast dreißigtausend Rubel um. Brand und Wiedergeburt – so lebte dieses Ufer.',
    'fr-FR':
        'Ici, au bord de l’eau, se dressait la richesse de la ville : les granges à grain. En 1743 on en comptait '
        'cinquante-cinq, et au milieu du XIXᵉ siècle une trentaine de granges sur le quai contenaient jusqu’à cent vingt '
        'mille tchetverts de grain. Le seigle et la farine, en sacs de tille, attendaient le bon prix, puis on les chargeait '
        'sur les barques — et en route vers l’amont de la Volga. Dès le milieu du XVIIIᵉ siècle, les deux tiers du grain de '
        'Tcheboksary partaient pour Saint-Pétersbourg, où il valait trois à quatre fois plus cher qu’ici.\n'
        'Le grain rendait les marchands rusés. Le prix s’écrivait sur la marchandise en lettres — chacun gardait son chiffre '
        'comme un grand secret. On interceptait les convois paysans aux abords de la ville pour qu’aucun prix honnête ne se '
        'forme sur la place. En 1833, le gouverneur de la ville Kropotkine fit barricader les rues latérales, afin que chaque '
        'convoi passe devant les gardes.\n'
        'Le 30 avril 1773, un incendie emporta vingt-neuf églises et sept cent dix-sept maisons. Les marchands Kliouev '
        'perdirent pour trois mille cent roubles de marchandises. Le fils du marchand emprunta, se remit à acheter du grain — '
        'et dix ans plus tard près de trente mille roubles tournaient entre ses mains. Incendie et renaissance : ainsi vivait '
        'cette rive.',
    'zh-Hans':
        '就在这水边，曾矗立着这座城市的财富——粮仓。1743年清点出五十五座；到十九世纪中叶，码头上约三十座粮仓可容纳多达十二万切特韦尔特的粮食。'
        '黑麦和面粉装在草席袋里，等到价钱合适，再装上平底船——溯伏尔加河而上。早在十八世纪中叶，切博克萨雷三分之二的粮食就运往圣彼得堡：'
        '那里的价钱是这里的三到四倍。\n'
        '粮食让商人变得精明。价格用字母写在货物上——各家的密码都当作天大的秘密。农民的车队在进城路口就被截住，好让广场上形成不了公道的价格。'
        '1833年市长克罗波特金下令封堵小街，让每一辆车都从岗哨前经过。\n'
        '1773年4月30日的大火吞噬了二十九座教堂和七百一十七栋房屋。克柳耶夫商人家损失了价值三千一百卢布的货物。商人的儿子借了钱，重新收购粮食'
        '——十年后，他手里周转的钱将近三万卢布。火灾与重生——这片河岸就是这样活过来的。',
    'hi-IN':
        'यहीं पानी के किनारे शहर की दौलत खड़ी थी — अनाज के गोदाम। 1743 में इनकी गिनती पचपन थी, और उन्नीसवीं सदी के मध्य में घाट पर क़रीब तीस '
        'गोदामों में एक लाख बीस हज़ार चेतवर्त तक अनाज समाता था। राई और आटा बोरियों में अच्छे दाम तक रखा जाता, फिर नावों पर लादकर — वोल्गा के ऊपर '
        'की ओर। अठारहवीं सदी के मध्य में ही चेबोक्सारी का दो-तिहाई अनाज पीटर्सबर्ग जाता था: वहाँ उसका दाम यहाँ से तीन-चार गुना था।\n'
        'अनाज ने व्यापारियों को चालाक बना दिया। दाम माल पर अक्षरों में लिखे जाते — अपना कोड हर कोई बड़े राज़ की तरह रखता। किसानों के काफ़िले शहर '
        'के रास्तों पर ही रोक लिए जाते, ताकि चौक पर ईमानदार दाम न बन सके। 1833 में नगराध्यक्ष क्रोपोत्किन ने बग़ल की गलियों को बंद करवा दिया — ताकि '
        'हर काफ़िला पहरे के सामने से गुज़रे।\n'
        '30 अप्रैल 1773 की आग उनतीस गिरजाघर और सात सौ सत्रह घर निगल गई। क्ल्यूयेव व्यापारियों का तीन हज़ार एक सौ रूबल का माल जला। व्यापारी '
        'के बेटे ने क़र्ज़ लिया, फिर से अनाज ख़रीदने लगा — और दस साल बाद उसके कारोबार में लगभग तीस हज़ार रूबल घूम रहे थे। आग और पुनर्जन्म — यह '
        'किनारा ऐसे ही जीता था।',
    'tr-TR':
        'Burada, suyun kıyısında şehrin serveti dururdu — tahıl ambarları. 1743’te elli beş ambar sayıldı; on dokuzuncu '
        'yüzyılın ortasında iskeledeki otuz kadar ambar yüz yirmi bin çetvert tahıl alıyordu. Çavdar ve un hasır çuvallarda '
        'uygun fiyata kadar bekletilir, sonra tekne­lere yüklenirdi — ve Volga’dan yukarı. Daha on sekizinci yüzyılın '
        'ortasında Çeboksarı tahılının üçte ikisi Petersburg’a gidiyordu: orada buradakinden üç dört kat pahalıydı.\n'
        'Tahıl tüccarları kurnazlaştırdı. Fiyat malın üstüne harflerle yazılır, herkes şifresini büyük bir sır gibi '
        'saklardı. Köylü arabaları şehre girişte durdurulurdu ki meydanda dürüst bir fiyat oluşmasın. 1833’te şehir '
        'yöneticisi Kropotkin yan sokakları barikatla kapattırdı — her araba nöbetçilerin önünden geçsin diye.\n'
        '30 Nisan 1773 yangını yirmi dokuz kiliseyi ve yedi yüz on yedi evi götürdü. Tüccar Klyuyevlerin üç bin yüz '
        'rublelik malı yandı. Tüccarın oğlu borç aldı, yeniden tahıl toplamaya başladı — on yıl sonra elinde neredeyse '
        'otuz bin ruble dönüyordu. Yangın ve yeniden doğuş — bu kıyı böyle yaşadı.',
}

# ============================================================== T09 — точка 6, гимназия
TEXTS['T09_GIMNAZIA_NARR'] = {
    'point': '6 · Женская гимназия',
    'who': 'Сетнер — рассказчик (голос нашего времени, источник на экране)',
    'voice': 'РАССКАЗЧИК', 'layer': 'НАУКА',
    'source': 'Чувашская энциклопедия: ст. «Чебоксарская женская гимназия» (А.П. Петрянкина) — https://chuvenc.ru/show_MainTable/151187; '
              'ст. «Ефремовы» (В.В. Орлов); workshome.ru «Женская гимназия» (архив web.archive.org 20241212160420, вторичный); '
              'судьба здания — Википедия «Образование в Чувашии» (третичный, перепроверить). См. СВЕРКА_Точка6 (П-015)',
    'status': 'ЧЕРНОВИК 22.10.2026 (П-016) — год преобразования 1908 по правилу приоритета энциклопедии; вычитка владельцем',
    'check': 'Судьбу здания после 1918 (педтехникум, сельхозинститут) подтвердить не по Википедии; улицу Чернышевского сверить со списком Терентьева.',
    'ru-RU':
        'Городу понадобилось восемь лет, чтобы открыть школу для девочек. Дума задумала прогимназию ещё в 1896 году, но '
        'денег от казны не дождалась. В 1904-м управа купила у купчихи Забродиной двухэтажный каменный дом на '
        'Набережно-Архангельской улице — десять тысяч рублей взяли в долг у купцов, первым среди них был Прокопий Ефремов. '
        'В середине октября к занятиям приступили сорок шесть девочек, выдержавших вступительные экзамены. Весь штат — '
        'начальница, две учительницы и законоучитель.\n'
        'Общежития не было: в 1907 году сто пятьдесят девять учениц жили группами на двадцати двух частных квартирах, и '
        'учителя обходили их по домам. Учили Закону Божьему, русскому и церковно-славянскому, арифметике и геометрии, '
        'немецкому и французскому, чистописанию, рисованию, пению и рукоделию. С 1908 года прогимназия стала гимназией, '
        'а к 1914-му здесь училось триста пять девочек. Одной из стипендиаток земства была О. И. Ырзем — будущая народная '
        'артистка Чувашской АССР.\n'
        'В 1918 году гимназию преобразовали в советскую школу второй ступени. Дом Забродиной потом занимали педагогический '
        'техникум и сельскохозяйственный институт, а улица стала называться Чернышевского.',
    'en-GB':
        'It took the town eight years to open a school for girls. The council first planned a pro-gymnasium in 1896, but '
        'the treasury never sent the money. In 1904 the town board bought a two-storey stone house on '
        'Naberezhno-Arkhangelskaya Street from the merchant’s widow Zabrodina — the ten thousand roubles were borrowed '
        'from merchants, the first of them Prokopy Yefremov. In mid-October forty-six girls who had passed the entrance '
        'examinations began their lessons. The whole staff: a headmistress, two teachers and a scripture teacher.\n'
        'There was no boarding house: in 1907 a hundred and fifty-nine pupils lived in groups in twenty-two private '
        'lodgings, and the teachers made the rounds of their homes. They studied scripture, Russian and Church Slavonic, '
        'arithmetic and geometry, German and French, penmanship, drawing, singing and needlework. From 1908 the '
        'pro-gymnasium became a full gymnasium, and by 1914 three hundred and five girls studied here. One of the '
        'district council’s scholarship girls was O. I. Yrzem — a future People’s Artist of the Chuvash republic.\n'
        'In 1918 the gymnasium was turned into a Soviet secondary school. Zabrodina’s house later held a teacher-training '
        'college and the agricultural institute, and the street was renamed after Chernyshevsky.',
    'de-DE':
        'Acht Jahre brauchte die Stadt, um eine Schule für Mädchen zu eröffnen. Die Duma plante das Progymnasium schon '
        '1896, doch das Geld vom Staat kam nie. 1904 kaufte die Stadtverwaltung von der Kaufmannswitwe Sabrodina ein '
        'zweistöckiges Steinhaus an der Nabereschno-Archangelskaja-Straße – die zehntausend Rubel lieh man sich bei '
        'Kaufleuten, als Erster bei Prokopi Jefremow. Mitte Oktober begannen sechsundvierzig Mädchen, die die '
        'Aufnahmeprüfung bestanden hatten, mit dem Unterricht. Das ganze Personal: eine Vorsteherin, zwei Lehrerinnen und '
        'ein Religionslehrer.\n'
        'Ein Wohnheim gab es nicht: 1907 wohnten hundertneunundfünfzig Schülerinnen gruppenweise in zweiundzwanzig '
        'Privatquartieren, und die Lehrer gingen von Haus zu Haus. Unterrichtet wurden Religion, Russisch und '
        'Kirchenslawisch, Arithmetik und Geometrie, Deutsch und Französisch, Schönschrift, Zeichnen, Gesang und Handarbeit. '
        'Ab 1908 wurde aus dem Progymnasium ein Gymnasium, und 1914 lernten hier dreihundertfünf Mädchen. Eine der '
        'Stipendiatinnen des Landkreises war O. I. Yrsem – spätere Volkskünstlerin der Tschuwaschischen Republik.\n'
        '1918 wurde das Gymnasium in eine sowjetische Schule der zweiten Stufe umgewandelt. Später beherbergte Sabrodinas '
        'Haus eine pädagogische Fachschule und das Landwirtschaftsinstitut, und die Straße bekam den Namen '
        'Tschernyschewskis.',
    'fr-FR':
        'Il fallut huit ans à la ville pour ouvrir une école de filles. La Douma projeta un pro-gymnase dès 1896, mais '
        'l’argent du Trésor ne vint jamais. En 1904, la municipalité acheta à la veuve de marchand Zabrodina une maison de '
        'pierre à deux étages rue Naberejno-Arkhangelskaïa — les dix mille roubles furent empruntés à des marchands, le '
        'premier d’entre eux Prokopi Efremov. À la mi-octobre, quarante-six filles ayant réussi l’examen d’entrée '
        'commencèrent les cours. Tout le personnel : une directrice, deux institutrices et un professeur de catéchisme.\n'
        'Pas d’internat : en 1907, cent cinquante-neuf élèves logeaient par groupes dans vingt-deux appartements privés, et '
        'les enseignants faisaient la tournée de leurs logis. On enseignait le catéchisme, le russe et le slavon d’église, '
        'l’arithmétique et la géométrie, l’allemand et le français, la calligraphie, le dessin, le chant et les travaux '
        'd’aiguille. À partir de 1908, le pro-gymnase devint un gymnase, et en 1914 trois cent cinq filles y étudiaient. '
        'L’une des boursières du zemstvo fut O. I. Yrzem — future Artiste du peuple de la république tchouvache.\n'
        'En 1918, le gymnase fut transformé en école soviétique du second degré. La maison Zabrodina abrita ensuite une '
        'école normale et l’institut agricole, et la rue prit le nom de Tchernychevski.',
    'zh-Hans':
        '这座城市花了八年才办起一所女子学校。市杜马早在1896年就计划设立女子预科中学，却始终没等到国库的拨款。1904年，市政府从商人遗孀'
        '扎布罗季娜手里买下了滨河-阿尔汉格尔斯克街上的一座两层石屋——一万卢布是向商人们借的，第一位出借者就是普罗科皮·叶夫列莫夫。'
        '十月中旬，四十六名通过入学考试的女孩开始上课。全部教职员：一位校长、两位女教师和一位宗教课教师。\n'
        '学校没有宿舍：1907年，一百五十九名女学生分组住在二十二处私人寓所，教师们挨家挨户走访。课程有神学、俄语和教会斯拉夫语、算术和几何、'
        '德语和法语、书法、绘画、唱歌和女红。从1908年起预科中学升格为正式中学，到1914年这里有三百零五名女生就读。地方自治会的奖学金'
        '获得者之一是О. И. 伊尔泽姆——后来的楚瓦什共和国人民演员。\n'
        '1918年，中学改为苏维埃二级学校。扎布罗季娜的房子后来先后是师范专科学校和农业学院，这条街则改名为车尔尼雪夫斯基街。',
    'hi-IN':
        'लड़कियों के लिए स्कूल खोलने में शहर को आठ साल लगे। ड्यूमा ने 1896 में ही प्रो-जिम्नेज़ियम की योजना बनाई थी, पर ख़ज़ाने से पैसा कभी नहीं आया। '
        '1904 में नगर प्रशासन ने व्यापारी-विधवा ज़ाब्रोदिना से नाबेरेज़्नो-अर्खांगेल्स्काया सड़क पर दो मंज़िला पत्थर का घर ख़रीदा — दस हज़ार रूबल '
        'व्यापारियों से उधार लिए गए, उनमें पहले थे प्रोकोपी येफ़्रेमोव। अक्टूबर के मध्य में प्रवेश परीक्षा पास करने वाली छियालीस लड़कियों की पढ़ाई शुरू हुई। '
        'पूरा स्टाफ़ — एक प्रधानाचार्या, दो शिक्षिकाएँ और एक धर्मशिक्षक।\n'
        'छात्रावास नहीं था: 1907 में एक सौ उनसठ छात्राएँ बाईस निजी घरों में समूहों में रहती थीं, और शिक्षक उनके घर-घर जाकर देखते थे। पढ़ाया जाता था '
        'धर्मशास्त्र, रूसी और चर्च-स्लावोनिक, अंकगणित और ज्यामिति, जर्मन और फ़्रेंच, सुलेख, चित्रकला, गायन और सिलाई-कढ़ाई। 1908 से प्रो-जिम्नेज़ियम '
        'पूरा जिम्नेज़ियम बन गया, और 1914 तक यहाँ तीन सौ पाँच लड़कियाँ पढ़ती थीं। ज़ेम्स्त्वो की छात्रवृत्ति पाने वालों में थीं ओ. आई. यर्ज़ेम — भविष्य '
        'की चुवाश गणराज्य की जन-कलाकार।\n'
        '1918 में जिम्नेज़ियम को सोवियत द्वितीय-स्तर स्कूल में बदल दिया गया। ज़ाब्रोदिना के घर में बाद में शिक्षक-प्रशिक्षण संस्थान और कृषि संस्थान रहे, '
        'और सड़क का नाम चेर्निशेव्स्की के नाम पर पड़ा।',
    'tr-TR':
        'Şehrin kızlar için bir okul açması sekiz yıl sürdü. Duma pro-gimnazyumu daha 1896’da tasarladı ama hazineden '
        'para gelmedi. 1904’te belediye, tüccar dulu Zabrodina’dan Naberejno-Arhangelskaya Sokağı’ndaki iki katlı taş evi '
        'satın aldı — on bin ruble tüccarlardan borç alındı, ilki Prokopiy Yefremov’du. Ekim ortasında giriş sınavını '
        'geçen kırk altı kız derslere başladı. Tüm kadro: bir müdire, iki öğretmen ve bir din öğretmeni.\n'
        'Yurt yoktu: 1907’de yüz elli dokuz öğrenci gruplar hâlinde yirmi iki özel evde kalıyordu ve öğretmenler ev ev '
        'dolaşıyordu. Din bilgisi, Rusça ve Kilise Slavcası, aritmetik ve geometri, Almanca ve Fransızca, güzel yazı, resim, '
        'şarkı ve el işi okutuluyordu. 1908’den itibaren pro-gimnazyum tam gimnazyum oldu, 1914’te burada üç yüz beş kız '
        'okuyordu. Zemstvo burslularından biri O. İ. Irzem’di — Çuvaş cumhuriyetinin gelecekteki halk sanatçısı.\n'
        '1918’de gimnazyum Sovyet ikinci kademe okuluna dönüştürüldü. Zabrodina’nın evinde sonra öğretmen okulu ve tarım '
        'enstitüsü yer aldı, sokak ise Çernişevski adını aldı.',
}

# ============================================================== T10 — точка 7, Владимирская горка
TEXTS['T10_GORKA_NARR'] = {
    'point': '7 · Владимирская горка',
    'who': 'Сетнер — рассказчик (голос нашего времени, источник на экране)',
    'voice': 'РАССКАЗЧИК', 'layer': 'НАУКА',
    'source': 'Чувашская энциклопедия: ст. «Владимирская чувашская женская община» (Ю.В. Гусаров) — https://chuvenc.ru/show_MainTable/150327; '
              'ст. «Спасо-Преображенский женский монастырь» (Ю.В. Гусаров) — https://chuvenc.ru/show_MainTable/154008; '
              'ст. «Усыпальница Ефремовых» (Н.И. Муратов) — https://chuvenc.ru/show_MainTable/150073. '
              '«С восемнадцатого века» — Владимирская (Сретенская) пустынь 1716 по sobory.ru (П-014, вторичный)',
    'status': 'ЧЕРНОВИК 22.10.2026 (П-016) — на фактах энциклопедии; вычитка владельцем',
    'check': 'Год основания пустыни (1716) подтвердить по ЧЭ или архиву; остальное — по трём статьям ЧЭ.',
    'ru-RU':
        'Эта горка — самое тихое место старого города. С восемнадцатого века здесь стояла Владимирская пустынь, а в 1899 '
        'году на её месте открыли чувашскую женскую общину. К началу двадцатого века тут были трёхпрестольный храм, '
        'больница с деревянной церковью, живописная и чеканная мастерские, сад и пруд, а с 1900 года — школа для '
        'девочек-сирот. Сестёр собиралось до полутораста.\n'
        'На склоне в 1908–1911 годах по проекту архитекторов Олешкевича, Деминева и Малиновского построили усыпальницу '
        'купцов Ефремовых — каменную часовню с куполом и коринфским портиком, единственный в Чувашии памятник '
        'мемориальной архитектуры. До 1918 года в её склепе стояли саркофаги Прокопия Ефремова и его жены Екатерины.\n'
        'В 1920 году в зданиях общины открыли детский дом, в 1930-м закрыли и церковь. Потом здесь были квартиры, '
        'бондарный цех, склады и реставрационные мастерские. В 1989 году храм вернули верующим, а 25 марта 1991 года '
        'монастырь возродился — теперь он Спасо-Преображенский. Усыпальница в том же году стала приходским храмом '
        'Иоанна Кронштадтского.',
    'en-GB':
        'This hill is the quietest corner of the old town. From the eighteenth century the Vladimir hermitage stood here, '
        'and in 1899 a Chuvash women’s community was opened in its place. By the early twentieth century there were a '
        'church with three altars, a hospital with a wooden chapel, icon-painting and metal-chasing workshops, a garden '
        'and a pond, and from 1900 a school for orphan girls. Up to a hundred and fifty sisters gathered here.\n'
        'On the slope, in 1908–1911, the Yefremov family tomb was built to a design by the architects Oleshkevich, '
        'Deminev and Malinovsky — a stone chapel with a dome and a Corinthian portico, the only monument of memorial '
        'architecture in Chuvashia. Until 1918 the sarcophagi of Prokopy Yefremov and his wife Yekaterina stood in its '
        'crypt.\n'
        'In 1920 a children’s home was opened in the community’s buildings; in 1930 the church too was closed. Later '
        'there were flats here, a cooper’s shop, warehouses and restoration workshops. In 1989 the church was returned to '
        'the faithful, and on 25 March 1991 the convent was reborn — now as the Transfiguration Convent. That same year '
        'the tomb became the parish church of St John of Kronstadt.',
    'de-DE':
        'Dieser Hügel ist der stillste Ort der Altstadt. Seit dem achtzehnten Jahrhundert stand hier die '
        'Wladimir-Einsiedelei, und 1899 wurde an ihrer Stelle eine tschuwaschische Frauengemeinschaft eröffnet. Zu Beginn '
        'des zwanzigsten Jahrhunderts gab es hier eine Kirche mit drei Altären, ein Krankenhaus mit Holzkapelle, eine '
        'Ikonenmaler- und eine Ziselierwerkstatt, einen Garten und einen Teich, ab 1900 auch eine Schule für Waisenmädchen. '
        'Bis zu hundertfünfzig Schwestern kamen hier zusammen.\n'
        'Am Hang wurde 1908–1911 nach dem Entwurf der Architekten Oleschkewitsch, Deminew und Malinowski die Grabkapelle '
        'der Kaufmannsfamilie Jefremow errichtet – eine steinerne Kapelle mit Kuppel und korinthischem Portikus, das '
        'einzige Denkmal der Memorialarchitektur in Tschuwaschien. Bis 1918 standen in ihrer Gruft die Sarkophage von '
        'Prokopi Jefremow und seiner Frau Jekaterina.\n'
        '1920 wurde in den Gebäuden der Gemeinschaft ein Kinderheim eröffnet, 1930 schloss man auch die Kirche. Später '
        'gab es hier Wohnungen, eine Böttcherei, Lager und Restaurierungswerkstätten. 1989 erhielten die Gläubigen die '
        'Kirche zurück, und am 25. März 1991 wurde das Kloster neu gegründet – heute das '
        'Verklärungskloster. Die Grabkapelle wurde im selben Jahr zur Pfarrkirche des heiligen Johannes von Kronstadt.',
    'fr-FR':
        'Cette colline est l’endroit le plus paisible de la vieille ville. Dès le XVIIIᵉ siècle s’y trouvait l’ermitage '
        'Saint-Vladimir, et en 1899 une communauté féminine tchouvache fut ouverte à sa place. Au début du XXᵉ siècle il y '
        'avait là une église à trois autels, un hôpital avec une chapelle en bois, des ateliers de peinture d’icônes et '
        'de ciselure, un jardin et un étang, et dès 1900 une école pour orphelines. Jusqu’à cent cinquante sœurs y '
        'vivaient.\n'
        'Sur la pente, en 1908–1911, on construisit sur les plans des architectes Olechkevitch, Deminev et Malinovski le '
        'tombeau des marchands Efremov — une chapelle de pierre à coupole et portique corinthien, unique monument '
        'd’architecture funéraire de Tchouvachie. Jusqu’en 1918, les sarcophages de Prokopi Efremov et de son épouse '
        'Ekaterina reposaient dans sa crypte.\n'
        'En 1920 on ouvrit un orphelinat dans les bâtiments de la communauté ; en 1930 l’église fut fermée à son tour. '
        'Il y eut ensuite ici des logements, une tonnellerie, des entrepôts et des ateliers de restauration. En 1989 '
        'l’église fut rendue aux fidèles, et le 25 mars 1991 le monastère renaquit — il est aujourd’hui le monastère de la '
        'Transfiguration. La même année, le tombeau devint l’église paroissiale Saint-Jean-de-Cronstadt.',
    'zh-Hans':
        '这座小山是老城最安静的地方。从十八世纪起这里就有弗拉基米尔隐修所，1899年在它的旧址上开设了楚瓦什女修道团体。到二十世纪初，'
        '这里有一座三祭坛的教堂、一所带木制小教堂的医院、圣像画坊和錾刻作坊、花园和池塘，1900年起还有一所孤女学校。修女多达一百五十人。\n'
        '1908至1911年间，在山坡上按建筑师奥列什克维奇、杰米涅夫和马利诺夫斯基的设计建起了叶夫列莫夫商人家族的陵墓——一座带穹顶和科林斯式'
        '柱廊的石砌小教堂，是楚瓦什唯一的纪念性建筑文物。直到1918年，普罗科皮·叶夫列莫夫和妻子叶卡捷琳娜的石棺一直安放在它的地下墓室。\n'
        '1920年，修道团体的房屋里办起了儿童之家，1930年教堂也被关闭。后来这里先后是住宅、制桶车间、仓库和修复作坊。1989年教堂归还'
        '信徒，1991年3月25日修道院重生——如今是主显圣容女修道院。同年，陵墓成了克隆施塔得的圣约翰堂区教堂。',
    'hi-IN':
        'यह पहाड़ी पुराने शहर की सबसे शांत जगह है। अठारहवीं सदी से यहाँ व्लादिमीर आश्रम था, और 1899 में उसकी जगह चुवाश महिला समुदाय खोला गया। '
        'बीसवीं सदी की शुरुआत तक यहाँ तीन वेदियों वाला गिरजाघर, लकड़ी के चैपल वाला अस्पताल, आइकन-चित्रण और धातु-उत्कीर्णन की कार्यशालाएँ, बाग़ और '
        'तालाब थे, और 1900 से अनाथ लड़कियों का स्कूल। डेढ़ सौ तक बहनें यहाँ रहती थीं।\n'
        'ढलान पर 1908–1911 में वास्तुकार ओलेश्केविच, देमिनेव और मालिनोव्स्की के डिज़ाइन से येफ़्रेमोव व्यापारी परिवार की समाधि बनी — गुंबद और '
        'कोरिंथियन स्तंभ-द्वार वाला पत्थर का चैपल, चुवाशिया का स्मारकीय वास्तुकला का इकलौता स्मारक। 1918 तक इसके तहख़ाने में प्रोकोपी येफ़्रेमोव '
        'और उनकी पत्नी येकातेरिना के शवाधान रखे थे।\n'
        '1920 में समुदाय की इमारतों में बाल-गृह खोला गया, 1930 में गिरजाघर भी बंद कर दिया गया। फिर यहाँ फ़्लैट, पीपा बनाने की कार्यशाला, गोदाम '
        'और जीर्णोद्धार कार्यशालाएँ रहीं। 1989 में गिरजाघर श्रद्धालुओं को लौटाया गया, और 25 मार्च 1991 को मठ पुनर्जीवित हुआ — अब यह रूपांतरण '
        '(स्पासो-प्रेओब्राज़ेन्स्की) मठ है। उसी साल समाधि क्रोनश्टाट के संत योआन का पैरिश चर्च बनी।',
    'tr-TR':
        'Bu tepe eski şehrin en sessiz yeridir. On sekizinci yüzyıldan beri burada Vladimir inziva manastırı vardı; '
        '1899’da onun yerine Çuvaş kadınlar topluluğu açıldı. Yirminci yüzyılın başında burada üç sunaklı bir kilise, '
        'ahşap şapelli bir hastane, ikona ve kakma atölyeleri, bahçe ve havuz, 1900’den itibaren de yetim kızlar için bir '
        'okul vardı. Yüz elliye kadar rahibe toplanırdı.\n'
        'Yamaçta 1908–1911’de mimarlar Oleşkeviç, Deminev ve Malinovskiy’nin projesiyle tüccar Yefremovların türbesi '
        'yapıldı — kubbeli ve Korint sütunlu taş bir şapel, Çuvaşistan’daki tek anıt mezar mimarisi örneği. 1918’e kadar '
        'mahzeninde Prokopiy Yefremov ile eşi Yekaterina’nın lahitleri duruyordu.\n'
        '1920’de topluluğun binalarında bir çocuk yurdu açıldı, 1930’da kilise de kapatıldı. Sonra burada daireler, fıçıcı '
        'atölyesi, depolar ve restorasyon atölyeleri oldu. 1989’da kilise inananlara geri verildi, 25 Mart 1991’de manastır '
        'yeniden doğdu — artık Başkalaşım Manastırı. Türbe aynı yıl Kronştadtlı Aziz İoann cemaat kilisesi oldu.',
}

# ============================================================== T11 — точка 8, фигурки залива
TEXTS['T11_FIGURKI_NARR'] = {
    'point': '8 · Парапеты залива: фигурки мифологии',
    'who': 'Сетнер — рассказчик (голос нашего времени, источник на экране)',
    'voice': 'РАССКАЗЧИК', 'layer': 'НАУКА',
    'source': 'Залив — Чувашская энциклопедия, ст. «Чебоксарский залив» (Р.К. Рахимов) — https://chuvenc.ru/show_MainTable/153562; '
              'фигурки — проект «Легенды Чувашского края» (Сбер, администрация города, ТИЦ), сентябрь 2024: grani21.ru, cheboksary555.ru (П-014); '
              'Нарспи и Сетнер — поэма К.В. Иванова «Нарспи» (1908)',
    'status': 'ЧЕРНОВИК 22.10.2026 (П-016); имена фигурок — по СМИ (П-014), материал фигурок не указан намеренно',
    'check': 'Сфотографировать все шесть фигурок и таблички (ТЗ фотографу, группа 1); сверить имена по табличкам.',
    'ru-RU':
        'Залив, который вы видите, моложе всего, о чём мы говорили: его первую очередь наполнили в 1980 году, а дамбу и '
        'фонтаны построили в 1996-м. Семь фонтанов — не украшение, а водовыпуск: так в залив подают волжскую воду. '
        'Большой бьёт четырьмя струями на двадцать метров, шесть малых стоят вокруг него по кругу.\n'
        'А на парапетах залива живут шесть маленьких фигурок героев чувашских легенд: Девушка на Луне, Лиса-плясунья, '
        'Красавица Плаги, Волга, Богатырь Улып и пара — Нарспи и Сетнер. Их поставили в 2024 году. Нарспи и Сетнер — из '
        'поэмы Константина Иванова, остальные — из проекта «Легенды Чувашского края».\n'
        'Найдите всех шестерых. Я — тот самый Сетнер, так что одну фигурку вы уже знаете в лицо.',
    'en-GB':
        'The bay you see is younger than anything we have talked about: its first section was filled in 1980, and the '
        'dam and fountains were built in 1996. The seven fountains are not decoration but an outlet: that is how Volga '
        'water is fed into the bay. The big one throws four jets twenty metres high; the six small ones stand around it in '
        'a circle.\n'
        'And on the parapets of the bay live six little figures of heroes from Chuvash legends: the Girl on the Moon, the '
        'Dancing Fox, Plagi the Beauty, Volga, Ulyp the Bogatyr, and a pair — Narspi and Setner. They were installed in '
        '2024. Narspi and Setner come from Konstantin Ivanov’s poem; the others from the project ‘Legends of the Chuvash '
        'Land’.\n'
        'Find all six. I am that very Setner — so you already know one of them by sight.',
    'de-DE':
        'Die Bucht, die Sie sehen, ist jünger als alles, wovon wir gesprochen haben: Ihr erster Abschnitt wurde 1980 '
        'gefüllt, Damm und Fontänen entstanden 1996. Die sieben Fontänen sind kein Schmuck, sondern ein Wasserauslass: So '
        'wird Wolgawasser in die Bucht geleitet. Die große schießt vier Strahlen zwanzig Meter hoch, die sechs kleinen '
        'stehen im Kreis um sie herum.\n'
        'Und auf den Brüstungen der Bucht leben sechs kleine Figuren von Helden tschuwaschischer Legenden: das Mädchen auf '
        'dem Mond, die tanzende Füchsin, die schöne Plagi, Wolga, der Recke Ulyp und ein Paar – Narspi und Setner. '
        'Aufgestellt wurden sie 2024. Narspi und Setner stammen aus dem Poem von Konstantin Iwanow, die übrigen aus dem '
        'Projekt „Legenden des Tschuwaschenlandes“.\n'
        'Finden Sie alle sechs. Ich bin jener Setner – eine Figur kennen Sie also schon vom Sehen.',
    'fr-FR':
        'La baie que vous voyez est plus jeune que tout ce dont nous avons parlé : sa première partie fut remplie en 1980, '
        'la digue et les fontaines construites en 1996. Les sept fontaines ne sont pas un ornement mais une prise d’eau : '
        'c’est ainsi que l’eau de la Volga alimente la baie. La grande lance quatre jets à vingt mètres, les six petites '
        'l’entourent en cercle.\n'
        'Et sur les parapets de la baie vivent six petites figurines de héros des légendes tchouvaches : la Jeune fille sur '
        'la Lune, la Renarde danseuse, la belle Plagui, Volga, le preux Oulyp et un couple — Narspi et Setner. Elles ont été '
        'installées en 2024. Narspi et Setner viennent du poème de Konstantin Ivanov, les autres du projet « Légendes du '
        'pays tchouvache ».\n'
        'Trouvez-les toutes les six. Je suis ce même Setner — vous en connaissez donc déjà une de vue.',
    'zh-Hans':
        '你眼前的海湾比我们讲过的一切都年轻：它的第一期在1980年注水，大坝和喷泉建于1996年。七座喷泉不是装饰，而是出水口：伏尔加河的水'
        '就是这样注入海湾的。大喷泉四股水柱高达二十米，六座小喷泉围成一圈。\n'
        '海湾的护栏上住着六个楚瓦什传说英雄的小雕像：月亮上的少女、跳舞的狐狸、美人普拉吉、伏尔加、勇士乌雷普，还有一对——纳尔斯皮与塞特涅尔。'
        '它们于2024年落成。纳尔斯皮与塞特涅尔出自康斯坦丁·伊万诺夫的长诗，其余的来自“楚瓦什大地的传说”项目。\n'
        '把六个都找出来吧。我就是那个塞特涅尔——所以有一个雕像你已经认得了。',
    'hi-IN':
        'जो खाड़ी आप देख रहे हैं, वह हमारी हर बात से नई है: इसका पहला चरण 1980 में भरा गया, और बाँध व फ़व्वारे 1996 में बने। सात फ़व्वारे सजावट '
        'नहीं, बल्कि जल-निकास हैं: इसी तरह वोल्गा का पानी खाड़ी में आता है। बड़ा फ़व्वारा चार धाराएँ बीस मीटर ऊँची फेंकता है, छह छोटे उसके चारों ओर '
        'गोल घेरे में खड़े हैं।\n'
        'और खाड़ी की मुँडेरों पर चुवाश किंवदंतियों के नायकों की छह छोटी मूर्तियाँ रहती हैं: चाँद पर लड़की, नाचती लोमड़ी, सुंदरी प्लागी, वोल्गा, वीर '
        'उलिप, और एक जोड़ी — नार्स्पी और सेत्नेर। इन्हें 2024 में स्थापित किया गया। नार्स्पी और सेत्नेर कोन्स्तान्तिन इवानोव की कविता से हैं, बाक़ी '
        '«चुवाश भूमि की किंवदंतियाँ» परियोजना से।\n'
        'सभी छह को ढूँढिए। मैं ही वह सेत्नेर हूँ — तो एक मूर्ति को आप पहले से पहचानते हैं।',
    'tr-TR':
        'Gördüğünüz körfez, anlattığımız her şeyden daha genç: ilk bölümü 1980’de dolduruldu, set ve fıskiyeler 1996’da '
        'yapıldı. Yedi fıskiye süs değil, su çıkışıdır: Volga suyu körfeze böyle verilir. Büyüğü dört fıskiyeyle yirmi '
        'metreye fışkırır, altı küçüğü çevresinde halka olur.\n'
        'Körfezin korkuluklarında ise Çuvaş efsane kahramanlarının altı küçük heykelciği yaşar: Ay’daki Kız, Dansçı '
        'Tilki, Güzel Plagi, Volga, Bahadır Ulıp ve bir çift — Narspi ile Setner. 2024’te yerleştirildiler. Narspi ile '
        'Setner Konstantin İvanov’un şiirinden, diğerleri “Çuvaş Diyarının Efsaneleri” projesinden.\n'
        'Altısını da bulun. O Setner benim — demek ki birini zaten yüzünden tanıyorsunuz.',
}

for tid, t in TEXTS.items():
    t['en-US'] = us(t['en-GB'])

# ============================================================== Интерфейс: новые ключи
UI = {}
def k(key, ru, gb, de, fr, zh, hi, tr):
    UI[key] = {'ru-RU': ru, 'en-GB': gb, 'en-US': us(gb), 'de-DE': de, 'fr-FR': fr, 'zh-Hans': zh, 'hi-IN': hi, 'tr-TR': tr}

k('pt.4', 'Дом купца Ефремова', 'The Yefremov Mansion', 'Das Jefremow-Haus', 'La maison Efremov', '叶夫列莫夫宅邸', 'येफ़्रेमोव हवेली', 'Yefremov Konağı')
k('pt.5', 'Хлебные амбары', 'The Grain Barns', 'Die Getreidespeicher', 'Les granges à grain', '粮仓', 'अनाज के गोदाम', 'Tahıl Ambarları')
k('pt.6', 'Женская гимназия', 'The Girls’ Gymnasium', 'Das Mädchengymnasium', 'Le gymnase de jeunes filles', '女子中学', 'कन्या जिम्नेज़ियम', 'Kız Gimnazyumu')
k('pt.7', 'Владимирская горка', 'Vladimir Hill', 'Der Wladimir-Hügel', 'La colline Saint-Vladimir', '弗拉基米尔山', 'व्लादिमीर पहाड़ी', 'Vladimir Tepesi')

k('h.4', 'Подойдите к особнякам Ефремовых на улице Константина Иванова — сегодня здесь Чувашский национальный музей.',
  'Go to the Yefremov mansions on Konstantin Ivanov Street — today they house the Chuvash National Museum.',
  'Gehen Sie zu den Jefremow-Villen in der Konstantin-Iwanow-Straße – heute ist hier das Tschuwaschische Nationalmuseum.',
  'Rendez-vous aux hôtels Efremov, rue Konstantin-Ivanov — aujourd’hui le Musée national tchouvache.',
  '走到康斯坦丁·伊万诺夫街的叶夫列莫夫宅邸——如今这里是楚瓦什国家博物馆。',
  'कोन्स्तान्तिन इवानोव सड़क पर येफ़्रेमोव हवेलियों तक जाइए — आज यहाँ चुवाश राष्ट्रीय संग्रहालय है।',
  'Konstantin İvanov Sokağı’ndaki Yefremov konaklarına gidin — bugün burada Çuvaş Ulusal Müzesi var.')
k('h.5', 'Спуститесь к воде, к старой пристани — туда, где к берегу подходили суда с хлебом.',
  'Go down to the water, to the old wharf — where the grain boats once came in.',
  'Gehen Sie hinunter ans Wasser, zur alten Anlegestelle – dorthin, wo die Getreidekähne anlegten.',
  'Descendez vers l’eau, à l’ancien embarcadère — là où accostaient les barques de grain.',
  '走到水边的老码头——当年运粮船就是在这里靠岸的。',
  'पानी की ओर, पुराने घाट तक उतरिए — जहाँ अनाज की नावें किनारे लगती थीं।',
  'Suya, eski iskeleye inin — tahıl teknelerinin kıyıya yanaştığı yere.')
k('h.6', 'Пройдите по набережной залива: гимназия стояла на Набережно-Архангельской улице, позже — Чернышевского.',
  'Walk along the bay embankment: the gymnasium stood on Naberezhno-Arkhangelskaya Street, later Chernyshevsky Street.',
  'Gehen Sie die Uferpromenade der Bucht entlang: Das Gymnasium stand an der Nabereschno-Archangelskaja-, später Tschernyschewski-Straße.',
  'Longez le quai de la baie : le gymnase se trouvait rue Naberejno-Arkhangelskaïa, devenue rue Tchernychevski.',
  '沿着海湾的堤岸走：中学曾在滨河-阿尔汉格尔斯克街上，后来改称车尔尼雪夫斯基街。',
  'खाड़ी के तट पर चलिए: जिम्नेज़ियम नाबेरेज़्नो-अर्खांगेल्स्काया, बाद में चेर्निशेव्स्की सड़क पर था।',
  'Körfez kıyısı boyunca yürüyün: gimnazyum Naberejno-Arhangelskaya, sonra Çernişevski Sokağı’ndaydı.')
k('h.7', 'Поднимитесь на Владимирскую горку к Спасо-Преображенскому монастырю; усыпальница Ефремовых — на склоне, вход с северной стороны.',
  'Climb Vladimir Hill to the Transfiguration Convent; the Yefremov tomb is on the slope, entrance from the north.',
  'Steigen Sie auf den Wladimir-Hügel zum Verklärungskloster; die Jefremow-Grabkapelle liegt am Hang, Eingang von Norden.',
  'Montez la colline Saint-Vladimir jusqu’au monastère de la Transfiguration ; le tombeau Efremov est sur la pente, entrée côté nord.',
  '登上弗拉基米尔山，到主显圣容修道院；叶夫列莫夫陵墓在山坡上，入口朝北。',
  'व्लादिमीर पहाड़ी पर रूपांतरण मठ तक चढ़िए; येफ़्रेमोव समाधि ढलान पर है, प्रवेश उत्तर की ओर से।',
  'Vladimir Tepesi’ne, Başkalaşım Manastırı’na çıkın; Yefremov türbesi yamaçta, girişi kuzeyden.')
k('h.8', 'Пройдите вдоль парапетов Чебоксарского залива и ищите маленькие фигурки.',
  'Walk along the parapets of Cheboksary Bay and look for the little figures.',
  'Gehen Sie an den Brüstungen der Tscheboksaryer Bucht entlang und suchen Sie die kleinen Figuren.',
  'Longez les parapets de la baie de Tcheboksary et cherchez les petites figurines.',
  '沿着切博克萨雷海湾的护栏走，寻找那些小雕像。',
  'चेबोक्सारी खाड़ी की मुँडेरों के साथ चलिए और छोटी मूर्तियाँ ढूँढिए।',
  'Çeboksarı Körfezi’nin korkulukları boyunca yürüyün ve küçük heykelcikleri arayın.')

k('today.4', 'Сегодня в особняках Ефремовых — музеи.', 'Today the Yefremov mansions are museums.',
  'Heute sind die Jefremow-Villen Museen.', 'Aujourd’hui, les hôtels Efremov sont des musées.',
  '如今叶夫列莫夫宅邸是博物馆。', 'आज येफ़्रेमोव हवेलियाँ संग्रहालय हैं।', 'Bugün Yefremov konakları müze.')
k('today.5', 'Сегодня здесь набережная и залив — амбаров давно нет.', 'Today this is the embankment and the bay — the barns are long gone.',
  'Heute sind hier Uferpromenade und Bucht – die Speicher gibt es längst nicht mehr.', 'Aujourd’hui, le quai et la baie — les granges ont disparu depuis longtemps.',
  '如今这里是堤岸和海湾——粮仓早已不在。', 'आज यहाँ तट और खाड़ी है — गोदाम कब के नहीं रहे।', 'Bugün burada kıyı ve körfez var — ambarlar çoktan yok.')
k('today.6', 'Сегодня здесь — набережная Чебоксарского залива.', 'Today this is the Cheboksary Bay embankment.',
  'Heute ist hier die Uferpromenade der Tscheboksaryer Bucht.', 'Aujourd’hui, c’est le quai de la baie de Tcheboksary.',
  '如今这里是切博克萨雷海湾的堤岸。', 'आज यहाँ चेबोक्सारी खाड़ी का तट है।', 'Bugün burası Çeboksarı Körfezi kıyısı.')
k('today.7', 'Монастырь действует и сегодня; усыпальница — приходской храм Иоанна Кронштадтского.',
  'The convent is active today; the tomb is the parish church of St John of Kronstadt.',
  'Das Kloster ist heute aktiv; die Grabkapelle ist die Pfarrkirche des heiligen Johannes von Kronstadt.',
  'Le monastère est toujours en activité ; le tombeau est l’église paroissiale Saint-Jean-de-Cronstadt.',
  '修道院至今仍在运作；陵墓是克隆施塔得的圣约翰堂区教堂。', 'मठ आज भी सक्रिय है; समाधि क्रोनश्टाट के संत योआन का पैरिश चर्च है।',
  'Manastır bugün de faal; türbe Kronştadtlı Aziz İoann cemaat kilisesi.')
k('today.8', 'Сегодня это главное место прогулок горожан.', 'Today this is the townspeople’s favourite promenade.',
  'Heute ist dies die beliebteste Promenade der Stadt.', 'Aujourd’hui, c’est la promenade préférée des habitants.',
  '如今这里是市民最爱散步的地方。', 'आज यह नगरवासियों की सैर की मुख्य जगह है।', 'Bugün burası şehir halkının başlıca gezinti yeri.')

k('q.4', 'Сколько кулей в год делала кулеткацкая мастерская Ефремовых?', 'How many sacks a year did the Yefremovs’ bast-sack workshop make?',
  'Wie viele Säcke im Jahr fertigte die Bastsack-Werkstatt der Jefremows?', 'Combien de sacs par an fabriquait l’atelier de sacs des Efremov ?',
  '叶夫列莫夫家的麻袋作坊每年织多少条麻袋？', 'येफ़्रेमोव की बोरी-कार्यशाला साल में कितनी बोरियाँ बनाती थी?', 'Yefremovların çuval atölyesi yılda kaç çuval dokuyordu?')
k('r.4', 'Верно — до тридцати тысяч кулей: тридцать взрослых и шестьдесят подростков.', 'Correct — up to thirty thousand sacks: thirty adults and sixty youngsters.',
  'Richtig – bis zu dreißigtausend Säcke: dreißig Erwachsene und sechzig Jugendliche.', 'Exact — jusqu’à trente mille sacs : trente adultes et soixante adolescents.',
  '正确——多达三万条：三十名成人和六十名少年。', 'सही — तीस हज़ार तक बोरियाँ: तीस वयस्क और साठ किशोर।', 'Doğru — otuz bin çuvala kadar: otuz yetişkin ve altmış genç.')
k('q.5', 'Сколько амбаров с хлебом и припасами сгорело в пожаре 1773 года по докладу губернатора?', 'According to the governor’s report, how many barns with grain and provisions burned in the fire of 1773?',
  'Wie viele Speicher mit Getreide und Vorräten verbrannten laut Bericht des Gouverneurs beim Brand von 1773?', 'Selon le rapport du gouverneur, combien de granges à grain et provisions brûlèrent dans l’incendie de 1773 ?',
  '据省长报告，1773年大火烧毁了多少座存放粮食和物资的仓房？', 'गवर्नर की रिपोर्ट के अनुसार 1773 की आग में अनाज और रसद के कितने गोदाम जले?', 'Valinin raporuna göre 1773 yangınında tahıl ve erzak dolu kaç ambar yandı?')
k('r.5', 'Верно — сорок девять. А ещё двадцать девять церквей и семьсот семнадцать домов.', 'Correct — forty-nine. And twenty-nine churches and seven hundred and seventeen houses besides.',
  'Richtig – neunundvierzig. Und dazu neunundzwanzig Kirchen und siebenhundertsiebzehn Häuser.', 'Exact — quarante-neuf. Et aussi vingt-neuf églises et sept cent dix-sept maisons.',
  '正确——四十九座。还有二十九座教堂和七百一十七栋房屋。', 'सही — उनचास। और उनतीस गिरजाघर व सात सौ सत्रह घर भी।', 'Doğru — kırk dokuz. Ayrıca yirmi dokuz kilise ve yedi yüz on yedi ev.')
k('q.6', 'Сколько девочек пришли на первые занятия прогимназии в октябре 1904 года?', 'How many girls came to the pro-gymnasium’s first lessons in October 1904?',
  'Wie viele Mädchen kamen im Oktober 1904 zum ersten Unterricht des Progymnasiums?', 'Combien de filles vinrent aux premiers cours du pro-gymnase en octobre 1904 ?',
  '1904年10月有多少女孩来上预科中学的第一堂课？', 'अक्टूबर 1904 में प्रो-जिम्नेज़ियम की पहली कक्षाओं में कितनी लड़कियाँ आईं?', 'Ekim 1904’te pro-gimnazyumun ilk derslerine kaç kız geldi?')
k('r.6', 'Верно — сорок шесть. Каждая выдержала вступительный экзамен.', 'Correct — forty-six. Every one of them had passed the entrance examination.',
  'Richtig – sechsundvierzig. Jede hatte die Aufnahmeprüfung bestanden.', 'Exact — quarante-six. Chacune avait réussi l’examen d’entrée.',
  '正确——四十六名。每一位都通过了入学考试。', 'सही — छियालीस। हर एक ने प्रवेश परीक्षा पास की थी।', 'Doğru — kırk altı. Her biri giriş sınavını geçmişti.')
k('q.7', 'В каком году возродился женский монастырь на Владимирской горке?', 'In what year was the convent on Vladimir Hill reborn?',
  'In welchem Jahr wurde das Frauenkloster auf dem Wladimir-Hügel neu gegründet?', 'En quelle année le monastère de la colline Saint-Vladimir a-t-il renaît ?',
  '弗拉基米尔山上的女修道院是哪一年重生的？', 'व्लादिमीर पहाड़ी का मठ किस साल पुनर्जीवित हुआ?', 'Vladimir Tepesi’ndeki manastır hangi yıl yeniden doğdu?')
k('r.7', 'Верно — 25 марта 1991 года, Спасо-Преображенский.', 'Correct — on 25 March 1991, as the Transfiguration Convent.',
  'Richtig – am 25. März 1991, als Verklärungskloster.', 'Exact — le 25 mars 1991, sous le nom de monastère de la Transfiguration.',
  '正确——1991年3月25日，主显圣容修道院。', 'सही — 25 मार्च 1991, रूपांतरण मठ के रूप में।', 'Doğru — 25 Mart 1991’de, Başkalaşım Manastırı olarak.')
k('q.8', 'Сколько фигурок героев легенд стоит на парапетах залива?', 'How many figures of legendary heroes stand on the parapets of the bay?',
  'Wie viele Figuren von Legendenhelden stehen auf den Brüstungen der Bucht?', 'Combien de figurines de héros légendaires se trouvent sur les parapets de la baie ?',
  '海湾护栏上有多少个传说英雄的雕像？', 'खाड़ी की मुँडेरों पर किंवदंती-नायकों की कितनी मूर्तियाँ हैं?', 'Körfezin korkuluklarında kaç efsane kahramanı heykelciği var?')
k('r.8', 'Верно — шесть. И одна из них — я.', 'Correct — six. And one of them is me.',
  'Richtig – sechs. Und eine davon bin ich.', 'Exact — six. Et l’une d’elles, c’est moi.',
  '正确——六个。其中一个就是我。', 'सही — छह। और उनमें से एक मैं हूँ।', 'Doğru — altı. Ve biri benim.')

k('spk.fonbrant', 'Фон Брант, казанский губернатор, 1773', 'Von Brandt, Governor of Kazan, 1773', 'von Brandt, Gouverneur von Kasan, 1773',
  'Von Brandt, gouverneur de Kazan, 1773', '冯·勃兰特，喀山省长，1773', 'फ़ॉन ब्रांट, कज़ान के गवर्नर, 1773', 'von Brandt, Kazan Valisi, 1773')

k('ui.map2', 'Этап «Купеческий город»', 'Stage: ‘The Merchants’ Town’', 'Etappe „Die Kaufmannsstadt“', 'Étape « La ville des marchands »',
  '关卡：“商人之城”', 'चरण: «व्यापारियों का नगर»', 'Etap: “Tüccarlar Şehri”')
k('ui.about', 'О проекте', 'About', 'Über das Projekt', 'À propos', '关于项目', 'परियोजना के बारे में', 'Proje hakkında')
k('ui.pwa_hint', 'Чтобы открывать как приложение на iPhone: «Поделиться» → «На экран „Домой“».',
  'To open as an app on iPhone: Share → Add to Home Screen.',
  'Als App auf dem iPhone öffnen: „Teilen“ → „Zum Home-Bildschirm“.',
  'Pour l’ouvrir comme une application sur iPhone : Partager → Sur l’écran d’accueil.',
  '在 iPhone 上以应用方式打开：分享 → 添加到主屏幕。',
  'iPhone पर ऐप की तरह खोलने के लिए: शेयर → होम स्क्रीन पर जोड़ें।',
  'iPhone’da uygulama gibi açmak için: Paylaş → Ana Ekrana Ekle.')
k('ui.tab_route', 'Маршрут', 'Route', 'Route', 'Parcours', '路线', 'मार्ग', 'Rota')
k('ui.tab_finds', 'Находки', 'Finds', 'Funde', 'Trouvailles', '发现', 'खोजें', 'Buluntular')
k('ui.tab_setner', 'Сетнер', 'Setner', 'Setner', 'Setner', '塞特涅尔', 'सेत्नेर', 'Setner')
k('ui.tab_about', 'О проекте', 'About', 'Über', 'À propos', '关于', 'परियोजना', 'Hakkında')
k('ui.about_title', 'Как устроена игра', 'How the game is made', 'Wie das Spiel gemacht ist', 'Comment le jeu est construit',
  '这个游戏是怎样做成的', 'यह खेल कैसे बना है', 'Oyun nasıl yapıldı')
k('ui.about_text',
  'Каждый текст в игре стоит на документе, научной работе или честно назван преданием. Источник — рядом с каждым рассказом. Мы ничего не придумываем: если факта нет, мы так и говорим.',
  'Every text in the game rests on a document, a scholarly work, or is honestly labelled a legend. The source sits beside every story. We invent nothing: where there is no fact, we say so.',
  'Jeder Text im Spiel beruht auf einem Dokument, einer wissenschaftlichen Arbeit oder ist ehrlich als Überlieferung gekennzeichnet. Die Quelle steht bei jeder Erzählung. Wir erfinden nichts: Gibt es keinen Beleg, sagen wir das.',
  'Chaque texte du jeu repose sur un document, un travail scientifique, ou est honnêtement présenté comme une légende. La source accompagne chaque récit. Nous n’inventons rien : s’il n’y a pas de fait, nous le disons.',
  '游戏中的每一段文字都基于文献、学术著作，或者被诚实地标注为传说。每个故事旁边都有出处。我们不编造任何东西：如果没有事实依据，我们会直说。',
  'खेल का हर पाठ किसी दस्तावेज़, शोध-कार्य पर टिका है या ईमानदारी से किंवदंती कहा गया है। हर कहानी के साथ स्रोत है। हम कुछ नहीं गढ़ते: तथ्य न हो तो हम वैसा ही कहते हैं।',
  'Oyundaki her metin bir belgeye, bilimsel bir çalışmaya dayanır ya da dürüstçe efsane diye adlandırılır. Kaynak her anlatının yanındadır. Hiçbir şey uydurmuyoruz: olgu yoksa bunu söyleriz.')
k('ui.privacy', 'Приложение не собирает никаких данных. Имя и телефон не нужны — только код, если захотите продолжить с Сетнером.',
  'The app collects no data at all. No name or phone needed — just your code, if you want to carry on with Setner.',
  'Die App sammelt keinerlei Daten. Kein Name, keine Telefonnummer – nur Ihr Code, wenn Sie mit Setner weitermachen möchten.',
  'L’application ne collecte aucune donnée. Ni nom ni téléphone — seulement votre code, si vous voulez continuer avec Setner.',
  '本应用不收集任何数据。不需要姓名和电话——只需您的代码，如果您想和塞特涅尔继续的话。',
  'ऐप कोई डेटा इकट्ठा नहीं करता। नाम-फ़ोन की ज़रूरत नहीं — बस आपका कोड, अगर आप सेत्नेर के साथ आगे बढ़ना चाहें।',
  'Uygulama hiçbir veri toplamaz. Ad ve telefon gerekmez — yalnızca kodunuz, Setner ile devam etmek isterseniz.')
k('ui.reset', 'Начать заново', 'Start over', 'Von vorn beginnen', 'Recommencer', '重新开始', 'फिर से शुरू करें', 'Baştan başla')
k('ui.reset_confirm', 'Сбросить прогресс и коллекцию?', 'Reset your progress and collection?', 'Fortschritt und Sammlung zurücksetzen?',
  'Réinitialiser la progression et la collection ?', '重置进度和收藏？', 'प्रगति और संग्रह रीसेट करें?', 'İlerleme ve koleksiyon sıfırlansın mı?')
k('ui.done', 'пройдено', 'completed', 'geschafft', 'terminé', '已完成', 'पूरा हुआ', 'tamamlandı')
k('ui.you_are_here', 'вы здесь', 'you are here', 'Sie sind hier', 'vous êtes ici', '您在这里', 'आप यहाँ हैं', 'buradasınız')
k('ui.ahead', 'впереди', 'ahead', 'voraus', 'à venir', '前方', 'आगे', 'ileride')
k('ui.kind_museum', 'подлинный предмет', 'authentic object', 'Originalfund', 'objet authentique', '真实文物', 'असली वस्तु', 'özgün nesne')
k('ui.kind_evidence', 'свидетельство', 'evidence', 'Zeugnis', 'témoignage', '文献证据', 'साक्ष्य', 'tanıklık')
k('ui.kind_game', 'игровая находка', 'game find', 'Spielfund', 'trouvaille de jeu', '游戏发现', 'खेल की खोज', 'oyun buluntusu')
k('ui.setner_intro', 'Сетнер — рассказчик этой прогулки и ваш проводник в Telegram. Покажите ему код — он отметит прохождение и подскажет, что дальше.',
  'Setner is the narrator of this walk and your guide on Telegram. Show him your code — he will log your progress and tell you what comes next.',
  'Setner ist der Erzähler dieses Spaziergangs und Ihr Begleiter auf Telegram. Zeigen Sie ihm Ihren Code – er vermerkt Ihren Fortschritt und sagt, wie es weitergeht.',
  'Setner est le narrateur de cette promenade et votre guide sur Telegram. Montrez-lui votre code — il notera votre parcours et vous dira la suite.',
  '塞特涅尔是这次漫步的讲述者，也是您在 Telegram 上的向导。把代码给他看——他会记录您的进度并告诉您接下来做什么。',
  'सेत्नेर इस सैर के कथावाचक और Telegram पर आपके मार्गदर्शक हैं। उन्हें अपना कोड दिखाइए — वे आपकी प्रगति दर्ज करेंगे और आगे का रास्ता बताएँगे।',
  'Setner bu yürüyüşün anlatıcısı ve Telegram’daki rehberinizdir. Ona kodunuzu gösterin — ilerlemenizi kaydeder ve sırada ne olduğunu söyler.')
k('ui.rank_1', 'Летописец Чебоксар', 'Chronicler of Cheboksary', 'Chronist von Tscheboksary', 'Chroniqueur de Tcheboksary', '切博克萨雷编年史家', 'चेबोक्सारी का इतिहासकार', 'Çeboksarı Vakanüvisi')
k('ui.rank_2', 'Краевед', 'Local historian', 'Heimatforscher', 'Historien local', '乡土史家', 'स्थानीय इतिहासवेत्ता', 'Yerel tarihçi')
k('ui.rank_3', 'Добрый гость города', 'A good guest of the town', 'Ein guter Gast der Stadt', 'Bon hôte de la ville', '城市的好客人', 'नगर का भला अतिथि', 'Şehrin iyi konuğu')
k('ui.stage2', 'К этапу «Купеческий город»', 'On to ‘The Merchants’ Town’', 'Weiter zur Etappe „Die Kaufmannsstadt“', 'Vers l’étape « La ville des marchands »',
  '前往“商人之城”', '«व्यापारियों का नगर» चरण की ओर', '“Tüccarlar Şehri” etabına')
k('ui.read_only', 'Читать можно сразу; задания — по порядку.', 'You can read any stop at once; tasks go in order.',
  'Lesen können Sie sofort; Aufgaben kommen der Reihe nach.', 'La lecture est libre ; les défis se font dans l’ordre.',
  '随时可以阅读；任务按顺序完成。', 'पढ़ना कभी भी; कार्य क्रम से।', 'Hemen okuyabilirsiniz; görevler sırayla.')
k('ui.copy', 'Скопировать', 'Copy', 'Kopieren', 'Copier', '复制', 'कॉपी करें', 'Kopyala')
k('ui.copied', 'Скопировано', 'Copied', 'Kopiert', 'Copié', '已复制', 'कॉपी हो गया', 'Kopyalandı')
k('ui.version', 'Версия содержания', 'Content version', 'Inhaltsversion', 'Version du contenu', '内容版本', 'सामग्री संस्करण', 'İçerik sürümü')
k('ui.unity_soon', '3D-сцены этой точки появятся в следующей версии.', '3D scenes for this stop will arrive in the next version.',
  '3D-Szenen für diesen Ort kommen in der nächsten Version.', 'Les scènes 3D de cette étape arriveront dans la prochaine version.',
  '本站的3D场景将在下一版本中推出。', 'इस पड़ाव के 3D दृश्य अगले संस्करण में आएँगे।', 'Bu durağın 3B sahneleri sonraki sürümde gelecek.')

k('art.A8_TORGOVY_DOM.name', 'Торговый дом «П. Е. Ефремов с сыновьями»', 'Trading house ‘P. Ye. Yefremov and Sons’', 'Handelshaus „P. J. Jefremow und Söhne“',
  'Maison de commerce « P. E. Efremov et fils »', '“П. Е. 叶夫列莫夫父子”商号', 'व्यापारिक घराना «पी. ये. येफ़्रेमोव और पुत्र»', '“P. Ye. Yefremov ve Oğulları” ticarethanesi')
k('art.A8_TORGOVY_DOM.desc', '1906 год. Основан с капиталом 325 тысяч рублей; распорядитель — Николай Ефремов. Свидетельство по Чувашской энциклопедии.',
  '1906. Founded with a capital of 325,000 roubles; managing partner Nikolai Yefremov. Evidence from the Chuvash Encyclopaedia.',
  '1906. Gegründet mit einem Kapital von 325 000 Rubel; Geschäftsführer Nikolai Jefremow. Zeugnis nach der Tschuwaschischen Enzyklopädie.',
  '1906. Fondée avec un capital de 325 000 roubles ; gérant Nikolaï Efremov. Témoignage d’après l’Encyclopédie tchouvache.',
  '1906年。创立资本32.5万卢布；经理尼古拉·叶夫列莫夫。据楚瓦什百科全书。', '1906। 325,000 रूबल पूँजी से स्थापित; प्रबंधक निकोलाई येफ़्रेमोव। चुवाश विश्वकोश के अनुसार।',
  '1906. 325 bin ruble sermayeyle kuruldu; yöneticisi Nikolay Yefremov. Çuvaş Ansiklopedisi’ne göre.')
k('art.A9_DOKLAD_1773.name', 'Доклад о пожаре 1773 года', 'Report on the fire of 1773', 'Bericht über den Brand von 1773', 'Rapport sur l’incendie de 1773',
  '1773年火灾报告', '1773 की आग की रिपोर्ट', '1773 yangını raporu')
k('art.A9_DOKLAD_1773.desc', 'Донесение казанского губернатора Фон Бранта в Сенат: 29 церквей, 717 домов, 49 амбаров. Свидетельство по учебному занятию «Тайны древнего кремля».',
  'The Kazan governor von Brandt’s report to the Senate: 29 churches, 717 houses, 49 barns. Evidence from the study module ‘Secrets of the Ancient Kremlin’.',
  'Bericht des Kasaner Gouverneurs von Brandt an den Senat: 29 Kirchen, 717 Häuser, 49 Speicher. Zeugnis nach der Lehreinheit „Geheimnisse des alten Kremls“.',
  'Rapport du gouverneur de Kazan von Brandt au Sénat : 29 églises, 717 maisons, 49 granges. Témoignage d’après le module « Secrets du vieux kremlin ».',
  '喀山省长冯·勃兰特给参议院的报告：29座教堂、717栋房屋、49座仓房。据教学课程《古克里姆林的秘密》。',
  'कज़ान के गवर्नर फ़ॉन ब्रांट की सीनेट को रिपोर्ट: 29 गिरजाघर, 717 घर, 49 गोदाम। शिक्षण-पाठ «प्राचीन क्रेमलिन के रहस्य» के अनुसार।',
  'Kazan Valisi von Brandt’ın Senato’ya raporu: 29 kilise, 717 ev, 49 ambar. “Eski Kremlin’in Sırları” ders modülüne göre.')
k('art.A10_PORTRETY_1908.name', 'Портреты Ефремовых в прогимназии', 'The Yefremov portraits in the pro-gymnasium', 'Die Jefremow-Porträts im Progymnasium',
  'Les portraits Efremov au pro-gymnase', '预科中学里的叶夫列莫夫肖像', 'प्रो-जिम्नेज़ियम में येफ़्रेमोव के चित्र', 'Pro-gimnazyumdaki Yefremov portreleri')
k('art.A10_PORTRETY_1908.desc', '1908 год. По решению городской думы в прогимназии установили портреты почётной попечительницы Екатерины Ефремовой и её мужа Прокопия. Свидетельство.',
  '1908. By decision of the town council, portraits of the honorary patroness Yekaterina Yefremova and her husband Prokopy were placed in the pro-gymnasium. Evidence.',
  '1908. Auf Beschluss der Stadtduma wurden im Progymnasium die Porträts der Ehrenpatronin Jekaterina Jefremowa und ihres Mannes Prokopi aufgestellt. Zeugnis.',
  '1908. Sur décision de la Douma municipale, les portraits de la protectrice d’honneur Ekaterina Efremova et de son mari Prokopi furent placés au pro-gymnase. Témoignage.',
  '1908年。经市杜马决定，预科中学里挂起了名誉监护人叶卡捷琳娜·叶夫列莫娃及其丈夫普罗科皮的肖像。文献证据。',
  '1908। नगर ड्यूमा के निर्णय से प्रो-जिम्नेज़ियम में मानद संरक्षिका येकातेरिना येफ़्रेमोवा और उनके पति प्रोकोपी के चित्र लगाए गए। साक्ष्य।',
  '1908. Şehir duması kararıyla pro-gimnazyuma onursal hamiye Yekaterina Yefremova ile eşi Prokopiy’in portreleri asıldı. Tanıklık.')
k('art.A11_PROEKT_1907.name', 'Проект усыпальницы, 1907', 'Design of the tomb, 1907', 'Entwurf der Grabkapelle, 1907', 'Projet du tombeau, 1907',
  '陵墓设计图，1907', 'समाधि की परियोजना, 1907', 'Türbe projesi, 1907')
k('art.A11_PROEKT_1907.desc', 'Архитекторы К. С. Олешкевич, М. Я. Деминев, Ф. Н. Малиновский. Часовня построена в 1908–1911 годах. Свидетельство по Чувашской энциклопедии.',
  'Architects K. S. Oleshkevich, M. Ya. Deminev, F. N. Malinovsky. The chapel was built in 1908–1911. Evidence from the Chuvash Encyclopaedia.',
  'Architekten K. S. Oleschkewitsch, M. J. Deminew, F. N. Malinowski. Die Kapelle wurde 1908–1911 gebaut. Zeugnis nach der Tschuwaschischen Enzyklopädie.',
  'Architectes K. S. Olechkevitch, M. Ya. Deminev, F. N. Malinovski. La chapelle fut construite en 1908–1911. Témoignage d’après l’Encyclopédie tchouvache.',
  '建筑师К. С. 奥列什克维奇、М. Я. 杰米涅夫、Ф. Н. 马利诺夫斯基。小教堂建于1908至1911年。据楚瓦什百科全书。',
  'वास्तुकार के. एस. ओलेश्केविच, एम. या. देमिनेव, एफ़. एन. मालिनोव्स्की। चैपल 1908–1911 में बना। चुवाश विश्वकोश के अनुसार।',
  'Mimarlar K. S. Oleşkeviç, M. Ya. Deminev, F. N. Malinovskiy. Şapel 1908–1911’de yapıldı. Çuvaş Ansiklopedisi’ne göre.')
k('art.A12_FIGURKI.name', 'Шесть фигурок залива', 'The six figures of the bay', 'Die sechs Figuren der Bucht', 'Les six figurines de la baie',
  '海湾的六个雕像', 'खाड़ी की छह मूर्तियाँ', 'Körfezin altı heykelciği')
k('art.A12_FIGURKI.desc', 'Девушка на Луне, Лиса-плясунья, Красавица Плаги, Волга, Богатырь Улып, Нарспи и Сетнер. Игровая находка: найдены все шесть.',
  'The Girl on the Moon, the Dancing Fox, Plagi the Beauty, Volga, Ulyp the Bogatyr, Narspi and Setner. Game find: all six found.',
  'Das Mädchen auf dem Mond, die tanzende Füchsin, die schöne Plagi, Wolga, der Recke Ulyp, Narspi und Setner. Spielfund: alle sechs gefunden.',
  'La Jeune fille sur la Lune, la Renarde danseuse, la belle Plagui, Volga, le preux Oulyp, Narspi et Setner. Trouvaille de jeu : toutes les six trouvées.',
  '月亮上的少女、跳舞的狐狸、美人普拉吉、伏尔加、勇士乌雷普、纳尔斯皮与塞特涅尔。游戏发现：六个全部找到。',
  'चाँद पर लड़की, नाचती लोमड़ी, सुंदरी प्लागी, वोल्गा, वीर उलिप, नार्स्पी और सेत्नेर। खेल की खोज: सभी छह मिल गए।',
  'Ay’daki Kız, Dansçı Tilki, Güzel Plagi, Volga, Bahadır Ulıp, Narspi ile Setner. Oyun buluntusu: altısı da bulundu.')

if __name__ == '__main__':
    print('текстов:', len(TEXTS), '| ui-ключей:', len(UI))
    for tid, t in TEXTS.items():
        print(tid, {l: len(t[l]) for l in L})
