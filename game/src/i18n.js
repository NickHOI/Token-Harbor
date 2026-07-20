export const LANGUAGE_STORAGE_KEY = "token-harbor-language";

export const LANGUAGES = [
  { id: "en", label: "English", short: "EN" },
  { id: "pt-BR", label: "Português (BR)", short: "PT" },
  { id: "de", label: "Deutsch", short: "DE" },
  { id: "fr", label: "Français", short: "FR" },
  { id: "ja", label: "日本語", short: "JA" },
  { id: "ko", label: "한국어", short: "KO" },
  { id: "zh-Hans", label: "简体中文", short: "简" },
  { id: "zh-Hant", label: "繁體中文", short: "繁" }
];

const zhHant = {
  "resource.power": "航力", "resource.coins": "金幣", "resource.distance": "總航程",
  "unit.nm": "海里", "unit.seconds": "秒", "unit.slots": "格", "unit.fish": "條", "unit.damage": "傷害",
  "top.harbor": "港口", "top.level": "港口等級", "nav.menu": "遊戲選單",
  "nav.harbor": "港口", "nav.voyages": "航線", "nav.warehouse": "貨倉", "nav.orders": "訂單", "nav.progression": "養成", "nav.settings": "設定",
  "port.open": "已開放", "port.building": "建設中", "port.berthOpen": "泊位開放",
  "world.map": "{period}{weather}中的航港群島地圖", "world.voyage": "{period}{weather}中的航程",
  "environment.visibility": "能見度 {value}",
  "port.eyebrow": "港口建設", "port.openStatus": "泊位已開放", "port.openCopy": "引航燈正常，船隊可從這裡出發。", "port.next": "查看下一港口",
  "port.progress": "建設進度", "port.allocate": "分配航力", "port.decrease": "減少航力", "port.increase": "增加航力", "port.invest": "投入 {value} 航力", "port.advanced": "港口建設推進", "port.keep": "未分配航力會一直保留。",
  "voyage.eyebrow": "船隊調度", "voyage.choose": "選擇航線", "voyage.cooler": "保鮮箱 {value} 格", "voyage.cargo": "船艙 {value} kg",
  "voyage.portLocked": "港口未開", "voyage.lighthouseLock": "燈塔 LV.{level}", "voyage.vesselLock": "需要 {level} 級船", "voyage.routeMeta": "{seconds} 秒 · {distance} 海里", "voyage.cost": "{value} 航力", "voyage.sailing": "航行中",
  "warehouse.eyebrow": "碼頭貨倉", "warehouse.title": "冷藏魚貨", "warehouse.cold": "冷庫 {stored} / {capacity}", "warehouse.price": "售價 ×{value}", "warehouse.note": "魚貨可交付訂單，也可逐條出售。",
  "orders.eyebrow": "港口訂單", "orders.title": "交付貨物", "orders.done": "已交付", "orders.deliver": "交付訂單", "orders.short": "貨物不足",
  "progress.eyebrow": "長期養成", "progress.title": "船隊與漁港", "progress.tabs": "養成分類", "progress.fleet": "船隊", "progress.equipment": "設備", "progress.crew": "船員", "progress.harbor": "漁港",
  "progress.active": "現役", "progress.use": "使用", "progress.berthShort": "泊位不足", "progress.lighthouseNeed": "燈塔需要 LV.{level}", "progress.activeShip": "現役", "progress.berths": "泊位", "progress.coastal": "近岸規格", "progress.school": "魚群 +{value}",
  "progress.net": "漁網", "progress.voyage": "航程", "progress.rarity": "稀有加成", "progress.cold": "冷庫", "progress.market": "市場", "progress.max": "MAX",
  "facility.berthValue": "{value} 個船位", "facility.coldValue": "{value} 條容量", "facility.marketValue": "售價 ×{value}", "facility.lightValue": "第 {value} 級海域",
  "settings.eyebrow": "偏好設定", "settings.title": "語言", "settings.copy": "介面會即時切換並記住選擇。", "settings.list": "選擇介面語言", "settings.selected": "目前語言",
  "onboarding.label": "新手引導", "onboarding.welcomeTitle": "歡迎登船", "onboarding.welcomeBody": "先選擇介面語言，之後可在設定隨時更改。", "onboarding.powerTitle": "工作累積航力", "onboarding.powerBody": "Codex 使用的 Token 會靜默轉成航力，先存起來，由你決定何時使用。", "onboarding.harborTitle": "所有專案，共用一港", "onboarding.harborBody": "不同 Codex 專案都為同一座港口累積航力；投入航力便可建設新港。", "onboarding.routeTitle": "親自出海是主玩法", "onboarding.routeBody": "消耗航力選擇航線。海域越遠，魚越稀有，船和燈塔要求也越高。", "onboarding.catchTitle": "追蹤魚群捕獲", "onboarding.catchBody": "魚會突然加速。追上並連續點擊，生命歸零才會進入漁艙。", "onboarding.codexTitle": "工作永遠優先", "onboarding.codexBody": "Codex 需要批准或完成工作時，手動航程會暫停；處理後再回來。", "onboarding.skip": "略過", "onboarding.back": "上一步", "onboarding.next": "下一步", "onboarding.finish": "開始經營", "onboarding.replay": "重新播放引導",
  "fish.aria": "{name}，{rarity}，生命 {hp}/{max}", "fish.caught": "捕獲 {name}", "fish.hit": "命中 -{damage}",
  "voyage.done": "航程完成", "voyage.catch": "捕獲 {caught} / {total}", "voyage.pause": "暫停航行", "voyage.resume": "繼續航行", "voyage.instruction": "追蹤魚群點擊，生命歸零即可捕獲", "voyage.full": "漁艙已滿，回港後升級船體或保鮮箱",
  "voyage.codexWait": "Codex 正等候你", "voyage.paused": "航程已暫停", "voyage.codexCopy": "處理工作後再回來", "voyage.resumeCopy": "按右上角繼續航行", "voyage.summary": "航程結算", "voyage.fullReturn": "滿艙返航", "voyage.emptyReturn": "空艙返航", "voyage.noCatch": "本次沒有捕獲，仍會記錄航程。", "voyage.docking": "正在靠岸", "voyage.unload": "回港卸貨",
  "status.idle": "Codex 待命", "status.idleCopy": "新任務會在這裡同步", "status.running": "{count} 個 Codex 任務處理中", "status.sail": "可以安心出航", "status.approval": "Codex 正等候批准", "status.finished": "Codex 已完成工作", "status.paused": "航程已暫停",
  "loading.title": "港口啟航中", "loading.copy": "正在讀取本機存檔", "toast.close": "關閉訊息",
  "error.power": "航力不足。", "error.coins": "金幣不足。", "error.storage": "容量不足，請先升級。", "error.cargo": "貨物不足。", "error.locked": "尚未符合解鎖條件。", "error.busy": "目前航程不能執行此操作。", "error.max": "已達最高等級。", "error.action": "這項操作暫時不可用。"
};

const zhHans = {
  ...zhHant,
  "resource.power": "航力", "resource.coins": "金币", "resource.distance": "总航程", "unit.nm": "海里", "unit.fish": "条", "unit.damage": "伤害",
  "top.harbor": "港口", "top.level": "港口等级", "nav.menu": "游戏菜单", "nav.voyages": "航线", "nav.warehouse": "货仓", "nav.orders": "订单", "nav.progression": "养成", "nav.settings": "设置",
  "port.open": "已开放", "port.building": "建设中", "port.berthOpen": "泊位开放", "world.map": "{period}{weather}中的港口群岛地图", "world.voyage": "{period}{weather}中的航程", "environment.visibility": "能见度 {value}",
  "port.eyebrow": "港口建设", "port.openStatus": "泊位已开放", "port.openCopy": "引航灯正常，船队可从这里出发。", "port.next": "查看下一港口", "port.progress": "建设进度", "port.allocate": "分配航力", "port.decrease": "减少航力", "port.increase": "增加航力", "port.invest": "投入 {value} 航力", "port.advanced": "港口建设推进", "port.keep": "未分配航力会一直保留。",
  "voyage.eyebrow": "船队调度", "voyage.choose": "选择航线", "voyage.cooler": "保鲜箱 {value} 格", "voyage.cargo": "船舱 {value} kg", "voyage.portLocked": "港口未开", "voyage.lighthouseLock": "灯塔 LV.{level}", "voyage.vesselLock": "需要 {level} 级船", "voyage.sailing": "航行中",
  "warehouse.eyebrow": "码头货仓", "warehouse.title": "冷藏鱼货", "warehouse.cold": "冷库 {stored} / {capacity}", "warehouse.price": "售价 ×{value}", "warehouse.note": "鱼货可交付订单，也可逐条出售。",
  "orders.eyebrow": "港口订单", "orders.title": "交付货物", "orders.done": "已交付", "orders.deliver": "交付订单", "orders.short": "货物不足",
  "progress.eyebrow": "长期养成", "progress.title": "船队与渔港", "progress.tabs": "养成分类", "progress.fleet": "船队", "progress.equipment": "设备", "progress.crew": "船员", "progress.harbor": "渔港", "progress.active": "现役", "progress.use": "使用", "progress.berthShort": "泊位不足", "progress.lighthouseNeed": "灯塔需要 LV.{level}", "progress.activeShip": "现役", "progress.berths": "泊位", "progress.coastal": "近岸规格", "progress.school": "鱼群 +{value}", "progress.net": "渔网", "progress.voyage": "航程", "progress.rarity": "稀有加成", "progress.cold": "冷库", "progress.market": "市场",
  "facility.berthValue": "{value} 个船位", "facility.coldValue": "{value} 条容量", "facility.marketValue": "售价 ×{value}", "facility.lightValue": "第 {value} 级海域",
  "settings.eyebrow": "偏好设置", "settings.title": "语言", "settings.copy": "界面会即时切换并记住选择。", "settings.list": "选择界面语言", "settings.selected": "当前语言",
  "onboarding.label": "新手引导", "onboarding.welcomeTitle": "欢迎登船", "onboarding.welcomeBody": "先选择界面语言，之后可在设置中随时更改。", "onboarding.powerTitle": "工作积累航力", "onboarding.powerBody": "Codex 使用的 Token 会静默转成航力，先存起来，由你决定何时使用。", "onboarding.harborTitle": "所有项目，共用一港", "onboarding.harborBody": "不同 Codex 项目都为同一座港口积累航力；投入航力即可建设新港。", "onboarding.routeTitle": "亲自出海是主玩法", "onboarding.routeBody": "消耗航力选择航线。海域越远，鱼越稀有，船和灯塔要求也越高。", "onboarding.catchTitle": "追着鱼群捕获", "onboarding.catchBody": "鱼会突然加速。追上并连续点击，生命归零才会进入鱼舱。", "onboarding.codexTitle": "工作永远优先", "onboarding.codexBody": "Codex 需要批准或完成工作时，手动航程会暂停；处理后再回来。", "onboarding.skip": "跳过", "onboarding.back": "上一步", "onboarding.next": "下一步", "onboarding.finish": "开始经营", "onboarding.replay": "重新播放引导",
  "fish.aria": "{name}，{rarity}，生命 {hp}/{max}", "fish.caught": "捕获 {name}", "fish.hit": "命中 -{damage}",
  "voyage.done": "航程完成", "voyage.catch": "捕获 {caught} / {total}", "voyage.pause": "暂停航行", "voyage.resume": "继续航行", "voyage.instruction": "追着鱼群点击，生命归零即可捕获", "voyage.full": "鱼舱已满，回港后升级船体或保鲜箱", "voyage.codexWait": "Codex 正在等你", "voyage.paused": "航程已暂停", "voyage.codexCopy": "处理工作后再回来", "voyage.resumeCopy": "按右上角继续航行", "voyage.summary": "航程结算", "voyage.fullReturn": "满舱返航", "voyage.emptyReturn": "空舱返航", "voyage.noCatch": "本次没有捕获，仍会记录航程。", "voyage.docking": "正在靠岸", "voyage.unload": "回港卸货",
  "status.idle": "Codex 待命", "status.idleCopy": "新任务会在这里同步", "status.running": "{count} 个 Codex 任务处理中", "status.sail": "可以安心出航", "status.approval": "Codex 正等待批准", "status.finished": "Codex 已完成工作", "status.paused": "航程已暂停", "loading.title": "港口启航中", "loading.copy": "正在读取本机存档", "toast.close": "关闭消息",
  "error.power": "航力不足。", "error.coins": "金币不足。", "error.storage": "容量不足，请先升级。", "error.cargo": "货物不足。", "error.locked": "尚未满足解锁条件。", "error.busy": "当前航程不能执行此操作。", "error.max": "已达最高等级。", "error.action": "该操作暂时不可用。"
};

const en = {
  "resource.power": "Sail Power", "resource.coins": "Coins", "resource.distance": "Distance", "unit.nm": "nm", "unit.seconds": "sec", "unit.slots": "slots", "unit.fish": "fish", "unit.damage": "damage",
  "top.harbor": "Harbor", "top.level": "Harbor level", "nav.menu": "Game menu", "nav.harbor": "Harbor", "nav.voyages": "Voyages", "nav.warehouse": "Storage", "nav.orders": "Orders", "nav.progression": "Upgrade", "nav.settings": "Settings",
  "port.open": " open", "port.building": " building", "port.berthOpen": "Berth open", "world.map": "Harbor map in {period}, {weather}", "world.voyage": "Voyage in {period}, {weather}", "environment.visibility": "Visibility {value}",
  "port.eyebrow": "HARBOR WORKS", "port.openStatus": "Berth open", "port.openCopy": "Beacons ready. The fleet can sail.", "port.next": "Next harbor", "port.progress": "Build progress", "port.allocate": "Assign power", "port.decrease": "Reduce power", "port.increase": "Add power", "port.invest": "Use {value} power", "port.advanced": "Construction advanced", "port.keep": "Unused power stays stored.",
  "voyage.eyebrow": "FLEET CONTROL", "voyage.choose": "Choose Route", "voyage.cooler": "Cooler {value}", "voyage.cargo": "Hold {value} kg", "voyage.portLocked": "Port locked", "voyage.lighthouseLock": "Lighthouse LV.{level}", "voyage.vesselLock": "Need rank {level}", "voyage.routeMeta": "{seconds}s · {distance} nm", "voyage.cost": "{value} power", "voyage.sailing": "At sea",
  "warehouse.eyebrow": "DOCK STORAGE", "warehouse.title": "Fresh Catch", "warehouse.cold": "Cold Store {stored} / {capacity}", "warehouse.price": "Price ×{value}", "warehouse.note": "Fulfill orders or sell fish one by one.",
  "orders.eyebrow": "HARBOR ORDERS", "orders.title": "Deliver Cargo", "orders.done": "Delivered", "orders.deliver": "Deliver", "orders.short": "Need fish",
  "progress.eyebrow": "LONG-TERM GROWTH", "progress.title": "Fleet & Harbor", "progress.tabs": "Upgrade groups", "progress.fleet": "Fleet", "progress.equipment": "Gear", "progress.crew": "Crew", "progress.harbor": "Harbor", "progress.active": "Active", "progress.use": "Use", "progress.berthShort": "No berth", "progress.lighthouseNeed": "Lighthouse LV.{level} needed", "progress.activeShip": "Active", "progress.berths": "Berths", "progress.coastal": "Coastal spec", "progress.school": "Encounters +{value}", "progress.net": "Net", "progress.voyage": "Voyage", "progress.rarity": "Rare bonus", "progress.cold": "Cold store", "progress.market": "Market", "progress.max": "MAX",
  "facility.berthValue": "Berths: {value}", "facility.coldValue": "{value} fish cap", "facility.marketValue": "Price ×{value}", "facility.lightValue": "Sea tier {value}",
  "settings.eyebrow": "PREFERENCES", "settings.title": "Language", "settings.copy": "Applies now and stays saved.", "settings.list": "Interface language", "settings.selected": "Current language",
  "onboarding.label": "QUICK START", "onboarding.welcomeTitle": "Welcome aboard", "onboarding.welcomeBody": "Choose your language first. Change it anytime in Settings.", "onboarding.powerTitle": "Work earns Sail Power", "onboarding.powerBody": "Tokens used in Codex quietly become stored Sail Power. You decide when to spend it.", "onboarding.harborTitle": "Every project, one harbor", "onboarding.harborBody": "All Codex projects feed the same harbor. Assign power to open new ports.", "onboarding.routeTitle": "Manual voyages come first", "onboarding.routeBody": "Spend power to choose a route. Farther seas bring rarer fish and higher ship requirements.", "onboarding.catchTitle": "Chase to catch", "onboarding.catchBody": "Fish can burst forward. Keep up and click until their health reaches zero.", "onboarding.codexTitle": "Work always comes first", "onboarding.codexBody": "Manual voyages pause when Codex needs approval or finishes work. Handle it, then return.", "onboarding.skip": "Skip", "onboarding.back": "Back", "onboarding.next": "Next", "onboarding.finish": "Enter Harbor", "onboarding.replay": "Replay guide",
  "fish.aria": "{name}, {rarity}, health {hp}/{max}", "fish.caught": "Caught {name}", "fish.hit": "Hit -{damage}",
  "voyage.done": "Voyage complete", "voyage.catch": "Catch {caught} / {total}", "voyage.pause": "Pause voyage", "voyage.resume": "Resume voyage", "voyage.instruction": "Chase and click. Drain health to catch.", "voyage.full": "Hold full. Upgrade hull or cooler in port.", "voyage.codexWait": "Codex needs you", "voyage.paused": "Voyage paused", "voyage.codexCopy": "Handle work, then return", "voyage.resumeCopy": "Resume at top right", "voyage.summary": "Voyage results", "voyage.fullReturn": "Catch aboard", "voyage.emptyReturn": "Empty return", "voyage.noCatch": "No catch. Distance still counts.", "voyage.docking": "Docking", "voyage.unload": "Unload catch",
  "status.idle": "Codex ready", "status.idleCopy": "New tasks sync here", "status.running": "{count} Codex tasks running", "status.sail": "Safe to set sail", "status.approval": "Codex needs approval", "status.finished": "Codex finished", "status.paused": "Voyage paused", "loading.title": "Opening harbor", "loading.copy": "Loading local save", "toast.close": "Close message",
  "error.power": "Not enough sail power.", "error.coins": "Not enough coins.", "error.storage": "Capacity full. Upgrade first.", "error.cargo": "Cargo is missing.", "error.locked": "Unlock requirements not met.", "error.busy": "Unavailable during this voyage.", "error.max": "Already at max level.", "error.action": "Action unavailable."
};

const ptBR = {
  "resource.power": "Força", "resource.coins": "Moedas", "resource.distance": "Distância", "unit.nm": "mn", "unit.seconds": "s", "unit.slots": "vagas", "unit.fish": "peixes", "unit.damage": "dano",
  "top.harbor": "Porto", "top.level": "Nível do porto", "nav.menu": "Menu do jogo", "nav.harbor": "Porto", "nav.voyages": "Rotas", "nav.warehouse": "Armazém", "nav.orders": "Pedidos", "nav.progression": "Evoluir", "nav.settings": "Ajustes",
  "port.open": " aberto", "port.building": " em obra", "port.berthOpen": "Cais aberto", "world.map": "Mapa em {period}, {weather}", "world.voyage": "Viagem em {period}, {weather}", "environment.visibility": "Visibilidade {value}",
  "port.eyebrow": "OBRAS DO PORTO", "port.openStatus": "Cais aberto", "port.openCopy": "Sinal pronto. A frota pode sair.", "port.next": "Próximo porto", "port.progress": "Progresso", "port.allocate": "Alocar força", "port.decrease": "Reduzir força", "port.increase": "Aumentar força", "port.invest": "Usar {value} força", "port.advanced": "Obra avançou", "port.keep": "A força não usada fica guardada.",
  "voyage.eyebrow": "CONTROLE DA FROTA", "voyage.choose": "Escolher Rota", "voyage.cooler": "Caixa {value}", "voyage.cargo": "Porão {value} kg", "voyage.portLocked": "Porto fechado", "voyage.lighthouseLock": "Farol NV.{level}", "voyage.vesselLock": "Navio nível {level}", "voyage.routeMeta": "{seconds}s · {distance} mn", "voyage.cost": "{value} força", "voyage.sailing": "Navegando",
  "warehouse.eyebrow": "ARMAZÉM DO CAIS", "warehouse.title": "Pescado Fresco", "warehouse.cold": "Câmara {stored} / {capacity}", "warehouse.price": "Preço ×{value}", "warehouse.note": "Entregue pedidos ou venda por unidade.",
  "orders.eyebrow": "PEDIDOS DO PORTO", "orders.title": "Entregar Carga", "orders.done": "Entregue", "orders.deliver": "Entregar", "orders.short": "Faltam peixes",
  "progress.eyebrow": "EVOLUÇÃO", "progress.title": "Frota e Porto", "progress.tabs": "Grupos de evolução", "progress.fleet": "Frota", "progress.equipment": "Equip.", "progress.crew": "Tripulação", "progress.harbor": "Porto", "progress.active": "Ativo", "progress.use": "Usar", "progress.berthShort": "Sem cais", "progress.lighthouseNeed": "Farol NV.{level}", "progress.activeShip": "Ativo", "progress.berths": "Cais", "progress.coastal": "Uso costeiro", "progress.school": "Peixes +{value}", "progress.net": "Rede", "progress.voyage": "Viagem", "progress.rarity": "Bônus raro", "progress.cold": "Câmara", "progress.market": "Mercado", "progress.max": "MÁX",
  "facility.berthValue": "Cais: {value}", "facility.coldValue": "Limite {value}", "facility.marketValue": "Preço ×{value}", "facility.lightValue": "Mar nível {value}",
  "settings.eyebrow": "PREFERÊNCIAS", "settings.title": "Idioma", "settings.copy": "Muda agora e fica salvo.", "settings.list": "Idioma da interface", "settings.selected": "Idioma atual",
  "onboarding.label": "GUIA RÁPIDO", "onboarding.welcomeTitle": "Bem-vindo a bordo", "onboarding.welcomeBody": "Escolha o idioma. Mude quando quiser nos Ajustes.", "onboarding.powerTitle": "Trabalho gera força", "onboarding.powerBody": "Os Tokens usados no Codex viram força guardada. Você decide quando gastar.", "onboarding.harborTitle": "Projetos, um só porto", "onboarding.harborBody": "Todos os projetos Codex alimentam o mesmo porto. Use força para abrir novos portos.", "onboarding.routeTitle": "Viagens manuais primeiro", "onboarding.routeBody": "Gaste força e escolha a rota. Mares distantes têm peixes raros e exigem navios melhores.", "onboarding.catchTitle": "Persiga para pescar", "onboarding.catchBody": "Os peixes disparam. Acompanhe e clique até zerar a vida.", "onboarding.codexTitle": "O trabalho vem primeiro", "onboarding.codexBody": "A viagem manual pausa quando o Codex pede aprovação ou conclui. Resolva e volte.", "onboarding.skip": "Pular", "onboarding.back": "Voltar", "onboarding.next": "Avançar", "onboarding.finish": "Entrar no porto", "onboarding.replay": "Repetir guia",
  "fish.aria": "{name}, {rarity}, vida {hp}/{max}", "fish.caught": "Pegou {name}", "fish.hit": "Acerto -{damage}",
  "voyage.done": "Viagem concluída", "voyage.catch": "Pesca {caught} / {total}", "voyage.pause": "Pausar viagem", "voyage.resume": "Retomar viagem", "voyage.instruction": "Persiga e clique. Zere a vida para pegar.", "voyage.full": "Porão cheio. Melhore casco ou caixa.", "voyage.codexWait": "Codex precisa de você", "voyage.paused": "Viagem pausada", "voyage.codexCopy": "Resolva o trabalho e volte", "voyage.resumeCopy": "Retome no canto superior", "voyage.summary": "Resumo da viagem", "voyage.fullReturn": "Pesca a bordo", "voyage.emptyReturn": "Volta vazia", "voyage.noCatch": "Sem pesca. A distância conta.", "voyage.docking": "Atracando", "voyage.unload": "Descarregar",
  "status.idle": "Codex pronto", "status.idleCopy": "Novas tarefas aparecem aqui", "status.running": "{count} tarefas Codex ativas", "status.sail": "Pode navegar", "status.approval": "Codex pede aprovação", "status.finished": "Codex concluiu", "status.paused": "Viagem pausada", "loading.title": "Abrindo o porto", "loading.copy": "Carregando dados locais", "toast.close": "Fechar mensagem",
  "error.power": "Força insuficiente.", "error.coins": "Moedas insuficientes.", "error.storage": "Capacidade cheia. Melhore antes.", "error.cargo": "Carga insuficiente.", "error.locked": "Requisitos não cumpridos.", "error.busy": "Indisponível nesta viagem.", "error.max": "Nível máximo atingido.", "error.action": "Ação indisponível."
};

const de = {
  "resource.power": "Segelkraft", "resource.coins": "Münzen", "resource.distance": "Strecke", "unit.nm": "sm", "unit.seconds": "Sek.", "unit.slots": "Plätze", "unit.fish": "Fische", "unit.damage": "Schaden",
  "top.harbor": "Hafen", "top.level": "Hafenstufe", "nav.menu": "Spielmenü", "nav.harbor": "Hafen", "nav.voyages": "Routen", "nav.warehouse": "Lager", "nav.orders": "Aufträge", "nav.progression": "Ausbau", "nav.settings": "Optionen",
  "port.open": " offen", "port.building": " im Bau", "port.berthOpen": "Liegeplatz offen", "world.map": "Hafenkarte: {period}, {weather}", "world.voyage": "Fahrt: {period}, {weather}", "environment.visibility": "Sicht {value}",
  "port.eyebrow": "HAFENAUSBAU", "port.openStatus": "Liegeplatz offen", "port.openCopy": "Leuchtfeuer bereit. Die Flotte kann auslaufen.", "port.next": "Nächster Hafen", "port.progress": "Baufortschritt", "port.allocate": "Kraft zuweisen", "port.decrease": "Kraft senken", "port.increase": "Kraft erhöhen", "port.invest": "{value} Kraft nutzen", "port.advanced": "Bau fortgesetzt", "port.keep": "Ungenutzte Kraft bleibt erhalten.",
  "voyage.eyebrow": "FLOTTENSTEUERUNG", "voyage.choose": "Route wählen", "voyage.cooler": "Kühlbox {value}", "voyage.cargo": "Laderaum {value} kg", "voyage.portLocked": "Hafen gesperrt", "voyage.lighthouseLock": "Leuchtturm LV.{level}", "voyage.vesselLock": "Schiff Rang {level}", "voyage.routeMeta": "{seconds}s · {distance} sm", "voyage.cost": "{value} Kraft", "voyage.sailing": "Auf See",
  "warehouse.eyebrow": "HAFENLAGER", "warehouse.title": "Frischer Fang", "warehouse.cold": "Kühllager {stored} / {capacity}", "warehouse.price": "Preis ×{value}", "warehouse.note": "Aufträge füllen oder Fische einzeln verkaufen.",
  "orders.eyebrow": "HAFENAUFTRÄGE", "orders.title": "Fracht liefern", "orders.done": "Geliefert", "orders.deliver": "Liefern", "orders.short": "Fisch fehlt",
  "progress.eyebrow": "LANGZEIT-AUSBAU", "progress.title": "Flotte & Hafen", "progress.tabs": "Ausbaugruppen", "progress.fleet": "Flotte", "progress.equipment": "Ausrüst.", "progress.crew": "Crew", "progress.harbor": "Hafen", "progress.active": "Aktiv", "progress.use": "Nutzen", "progress.berthShort": "Kein Platz", "progress.lighthouseNeed": "Leuchtturm LV.{level}", "progress.activeShip": "Aktiv", "progress.berths": "Plätze", "progress.coastal": "Küstenschiff", "progress.school": "Fische +{value}", "progress.net": "Netz", "progress.voyage": "Fahrt", "progress.rarity": "Selten +", "progress.cold": "Kühllager", "progress.market": "Markt", "progress.max": "MAX",
  "facility.berthValue": "Plätze: {value}", "facility.coldValue": "Limit {value}", "facility.marketValue": "Preis ×{value}", "facility.lightValue": "See-Stufe {value}",
  "settings.eyebrow": "EINSTELLUNGEN", "settings.title": "Sprache", "settings.copy": "Sofort aktiv und gespeichert.", "settings.list": "Sprache der Oberfläche", "settings.selected": "Aktuelle Sprache",
  "onboarding.label": "SCHNELLSTART", "onboarding.welcomeTitle": "Willkommen an Bord", "onboarding.welcomeBody": "Zuerst Sprache wählen. Später unter Optionen änderbar.", "onboarding.powerTitle": "Arbeit bringt Segelkraft", "onboarding.powerBody": "Codex-Token werden still zu gespeicherter Segelkraft. Du entscheidest, wann sie genutzt wird.", "onboarding.harborTitle": "Alle Projekte, ein Hafen", "onboarding.harborBody": "Alle Codex-Projekte stärken denselben Hafen. Mit Kraft öffnest du neue Häfen.", "onboarding.routeTitle": "Manuelle Fahrten zuerst", "onboarding.routeBody": "Kraft ausgeben und Route wählen. Ferne Meere bieten seltene Fische und brauchen bessere Schiffe.", "onboarding.catchTitle": "Verfolgen und fangen", "onboarding.catchBody": "Fische sprinten plötzlich. Folge ihnen und klicke, bis das Leben null ist.", "onboarding.codexTitle": "Arbeit hat immer Vorrang", "onboarding.codexBody": "Manuelle Fahrten pausieren bei Freigaben oder fertiger Arbeit. Erledigen, dann zurück.", "onboarding.skip": "Überspringen", "onboarding.back": "Zurück", "onboarding.next": "Weiter", "onboarding.finish": "Hafen betreten", "onboarding.replay": "Anleitung neu starten",
  "fish.aria": "{name}, {rarity}, Leben {hp}/{max}", "fish.caught": "{name} gefangen", "fish.hit": "Treffer -{damage}",
  "voyage.done": "Fahrt beendet", "voyage.catch": "Fang {caught} / {total}", "voyage.pause": "Fahrt pausieren", "voyage.resume": "Fahrt fortsetzen", "voyage.instruction": "Verfolgen und klicken. Leben auf null senken.", "voyage.full": "Laderaum voll. Rumpf oder Kühlbox ausbauen.", "voyage.codexWait": "Codex braucht dich", "voyage.paused": "Fahrt pausiert", "voyage.codexCopy": "Arbeit erledigen, dann zurück", "voyage.resumeCopy": "Oben rechts fortsetzen", "voyage.summary": "Fahrtergebnis", "voyage.fullReturn": "Fang an Bord", "voyage.emptyReturn": "Leerfahrt", "voyage.noCatch": "Kein Fang. Die Strecke zählt.", "voyage.docking": "Anlegen", "voyage.unload": "Fang entladen",
  "status.idle": "Codex bereit", "status.idleCopy": "Neue Aufgaben erscheinen hier", "status.running": "{count} Codex-Aufgaben aktiv", "status.sail": "Auslaufen möglich", "status.approval": "Codex wartet auf Freigabe", "status.finished": "Codex ist fertig", "status.paused": "Fahrt pausiert", "loading.title": "Hafen wird geöffnet", "loading.copy": "Lokaler Spielstand lädt", "toast.close": "Meldung schließen",
  "error.power": "Nicht genug Segelkraft.", "error.coins": "Nicht genug Münzen.", "error.storage": "Kapazität voll. Erst ausbauen.", "error.cargo": "Fracht fehlt.", "error.locked": "Voraussetzungen fehlen.", "error.busy": "Während der Fahrt nicht möglich.", "error.max": "Maximalstufe erreicht.", "error.action": "Aktion nicht verfügbar."
};

const fr = {
  "resource.power": "Énergie", "resource.coins": "Pièces", "resource.distance": "Distance", "unit.nm": "mn", "unit.seconds": "s", "unit.slots": "places", "unit.fish": "poissons", "unit.damage": "dégâts",
  "top.harbor": "Port", "top.level": "Niveau du port", "nav.menu": "Menu du jeu", "nav.harbor": "Port", "nav.voyages": "Routes", "nav.warehouse": "Stock", "nav.orders": "Commandes", "nav.progression": "Progrès", "nav.settings": "Réglages",
  "port.open": " ouvert", "port.building": " en travaux", "port.berthOpen": "Quai ouvert", "world.map": "Carte : {period}, {weather}", "world.voyage": "Sortie : {period}, {weather}", "environment.visibility": "Visibilité {value}",
  "port.eyebrow": "TRAVAUX DU PORT", "port.openStatus": "Quai ouvert", "port.openCopy": "Balises prêtes. La flotte peut partir.", "port.next": "Port suivant", "port.progress": "Avancement", "port.allocate": "Allouer l’énergie", "port.decrease": "Réduire l’énergie", "port.increase": "Ajouter de l’énergie", "port.invest": "Utiliser {value}", "port.advanced": "Travaux avancés", "port.keep": "L’énergie non utilisée est gardée.",
  "voyage.eyebrow": "CONTRÔLE FLOTTE", "voyage.choose": "Choisir une route", "voyage.cooler": "Glacière {value}", "voyage.cargo": "Cale {value} kg", "voyage.portLocked": "Port verrouillé", "voyage.lighthouseLock": "Phare NV.{level}", "voyage.vesselLock": "Navire rang {level}", "voyage.routeMeta": "{seconds}s · {distance} mn", "voyage.cost": "{value} énergie", "voyage.sailing": "En mer",
  "warehouse.eyebrow": "STOCK DU QUAI", "warehouse.title": "Pêche fraîche", "warehouse.cold": "Froid {stored} / {capacity}", "warehouse.price": "Prix ×{value}", "warehouse.note": "Livrez les commandes ou vendez à l’unité.",
  "orders.eyebrow": "COMMANDES", "orders.title": "Livrer la cargaison", "orders.done": "Livrée", "orders.deliver": "Livrer", "orders.short": "Poissons requis",
  "progress.eyebrow": "PROGRESSION", "progress.title": "Flotte et port", "progress.tabs": "Catégories", "progress.fleet": "Flotte", "progress.equipment": "Équip.", "progress.crew": "Équipage", "progress.harbor": "Port", "progress.active": "Actif", "progress.use": "Utiliser", "progress.berthShort": "Quai plein", "progress.lighthouseNeed": "Phare NV.{level}", "progress.activeShip": "Actif", "progress.berths": "Quais", "progress.coastal": "Modèle côtier", "progress.school": "Poissons +{value}", "progress.net": "Filet", "progress.voyage": "Sortie", "progress.rarity": "Bonus rare", "progress.cold": "Chambre", "progress.market": "Marché", "progress.max": "MAX",
  "facility.berthValue": "Quais : {value}", "facility.coldValue": "Limite {value}", "facility.marketValue": "Prix ×{value}", "facility.lightValue": "Mer niveau {value}",
  "settings.eyebrow": "PRÉFÉRENCES", "settings.title": "Langue", "settings.copy": "Appliquée et enregistrée aussitôt.", "settings.list": "Langue de l’interface", "settings.selected": "Langue actuelle",
  "onboarding.label": "DÉMARRAGE", "onboarding.welcomeTitle": "Bienvenue à bord", "onboarding.welcomeBody": "Choisissez la langue. Modifiez-la ensuite dans Réglages.", "onboarding.powerTitle": "Le travail donne de l’énergie", "onboarding.powerBody": "Les Tokens utilisés par Codex deviennent de l’énergie stockée. Vous décidez quand l’utiliser.", "onboarding.harborTitle": "Tous les projets, un port", "onboarding.harborBody": "Tous les projets Codex alimentent le même port. Utilisez l’énergie pour ouvrir des ports.", "onboarding.routeTitle": "Sorties manuelles d’abord", "onboarding.routeBody": "Dépensez l’énergie et choisissez une route. Les mers lointaines offrent des poissons plus rares.", "onboarding.catchTitle": "Poursuivez pour capturer", "onboarding.catchBody": "Les poissons accélèrent soudain. Suivez-les et cliquez jusqu’à vider leur vie.", "onboarding.codexTitle": "Le travail reste prioritaire", "onboarding.codexBody": "La sortie manuelle se met en pause si Codex vous attend ou termine. Répondez puis revenez.", "onboarding.skip": "Ignorer", "onboarding.back": "Retour", "onboarding.next": "Suivant", "onboarding.finish": "Entrer au port", "onboarding.replay": "Revoir le guide",
  "fish.aria": "{name}, {rarity}, vie {hp}/{max}", "fish.caught": "{name} capturé", "fish.hit": "Touché -{damage}",
  "voyage.done": "Sortie terminée", "voyage.catch": "Pêche {caught} / {total}", "voyage.pause": "Mettre en pause", "voyage.resume": "Reprendre", "voyage.instruction": "Poursuivez et cliquez. Videz la vie pour capturer.", "voyage.full": "Cale pleine. Améliorez coque ou glacière.", "voyage.codexWait": "Codex a besoin de vous", "voyage.paused": "Sortie en pause", "voyage.codexCopy": "Finissez le travail puis revenez", "voyage.resumeCopy": "Reprendre en haut à droite", "voyage.summary": "Bilan de sortie", "voyage.fullReturn": "Pêche à bord", "voyage.emptyReturn": "Retour à vide", "voyage.noCatch": "Aucune prise. La distance compte.", "voyage.docking": "Accostage", "voyage.unload": "Décharger",
  "status.idle": "Codex prêt", "status.idleCopy": "Les tâches apparaissent ici", "status.running": "{count} tâches Codex actives", "status.sail": "Vous pouvez partir", "status.approval": "Codex attend l’accord", "status.finished": "Codex a terminé", "status.paused": "Sortie en pause", "loading.title": "Ouverture du port", "loading.copy": "Chargement local", "toast.close": "Fermer le message",
  "error.power": "Énergie insuffisante.", "error.coins": "Pièces insuffisantes.", "error.storage": "Capacité pleine. Améliorez-la.", "error.cargo": "Cargaison manquante.", "error.locked": "Conditions non remplies.", "error.busy": "Indisponible pendant la sortie.", "error.max": "Niveau maximal atteint.", "error.action": "Action indisponible."
};

const ja = {
  "resource.power": "航力", "resource.coins": "コイン", "resource.distance": "航海距離", "unit.nm": "海里", "unit.seconds": "秒", "unit.slots": "枠", "unit.fish": "匹", "unit.damage": "ダメージ",
  "top.harbor": "港", "top.level": "港レベル", "nav.menu": "ゲームメニュー", "nav.harbor": "港", "nav.voyages": "航路", "nav.warehouse": "倉庫", "nav.orders": "注文", "nav.progression": "育成", "nav.settings": "設定",
  "port.open": " 開放済み", "port.building": " 建設中", "port.berthOpen": "停泊地開放", "world.map": "{period}・{weather}の港マップ", "world.voyage": "{period}・{weather}の航海", "environment.visibility": "視界 {value}",
  "port.eyebrow": "港の建設", "port.openStatus": "停泊地開放", "port.openCopy": "誘導灯は正常。船団は出航できます。", "port.next": "次の港", "port.progress": "建設進捗", "port.allocate": "航力を配分", "port.decrease": "航力を減らす", "port.increase": "航力を増やす", "port.invest": "航力 {value} を投入", "port.advanced": "建設が進みました", "port.keep": "未使用の航力は保存されます。",
  "voyage.eyebrow": "船団運用", "voyage.choose": "航路を選択", "voyage.cooler": "保冷箱 {value}", "voyage.cargo": "船倉 {value} kg", "voyage.portLocked": "港が未開放", "voyage.lighthouseLock": "灯台 LV.{level}", "voyage.vesselLock": "船ランク {level}", "voyage.routeMeta": "{seconds}秒 · {distance}海里", "voyage.cost": "航力 {value}", "voyage.sailing": "航海中",
  "warehouse.eyebrow": "波止場倉庫", "warehouse.title": "鮮魚", "warehouse.cold": "冷蔵庫 {stored} / {capacity}", "warehouse.price": "価格 ×{value}", "warehouse.note": "注文に納品、または1匹ずつ売却できます。",
  "orders.eyebrow": "港の注文", "orders.title": "貨物を納品", "orders.done": "納品済み", "orders.deliver": "納品", "orders.short": "魚が不足",
  "progress.eyebrow": "長期育成", "progress.title": "船団と港", "progress.tabs": "育成分類", "progress.fleet": "船団", "progress.equipment": "装備", "progress.crew": "船員", "progress.harbor": "漁港", "progress.active": "現役", "progress.use": "使用", "progress.berthShort": "空きなし", "progress.lighthouseNeed": "灯台 LV.{level} 必要", "progress.activeShip": "現役", "progress.berths": "停泊地", "progress.coastal": "沿岸仕様", "progress.school": "魚群 +{value}", "progress.net": "漁網", "progress.voyage": "航海", "progress.rarity": "レア率", "progress.cold": "冷蔵庫", "progress.market": "市場", "progress.max": "MAX",
  "facility.berthValue": "{value} 隻分", "facility.coldValue": "容量 {value}", "facility.marketValue": "価格 ×{value}", "facility.lightValue": "海域ランク {value}",
  "settings.eyebrow": "環境設定", "settings.title": "言語", "settings.copy": "すぐに反映され、保存されます。", "settings.list": "表示言語", "settings.selected": "現在の言語",
  "onboarding.label": "はじめ方", "onboarding.welcomeTitle": "港へようこそ", "onboarding.welcomeBody": "最初に言語を選択。設定からいつでも変更できます。", "onboarding.powerTitle": "作業で航力を獲得", "onboarding.powerBody": "Codexで使用したトークンは航力に変わり、静かに保存されます。使う時は自分で決めます。", "onboarding.harborTitle": "全プロジェクトで一つの港", "onboarding.harborBody": "すべてのCodexプロジェクトが同じ港を育てます。航力を使って新港を開放します。", "onboarding.routeTitle": "手動航海がメイン", "onboarding.routeBody": "航力を使い航路を選択。遠い海ほど魚は珍しく、より良い船が必要です。", "onboarding.catchTitle": "追って捕獲", "onboarding.catchBody": "魚は急加速します。追いながらクリックし、体力を0にします。", "onboarding.codexTitle": "作業を最優先", "onboarding.codexBody": "Codexが承認待ちまたは作業完了になると手動航海は停止。対応後に戻れます。", "onboarding.skip": "スキップ", "onboarding.back": "戻る", "onboarding.next": "次へ", "onboarding.finish": "港を始める", "onboarding.replay": "ガイドを再表示",
  "fish.aria": "{name}、{rarity}、体力 {hp}/{max}", "fish.caught": "{name}を捕獲", "fish.hit": "命中 -{damage}",
  "voyage.done": "航海完了", "voyage.catch": "捕獲 {caught} / {total}", "voyage.pause": "航海を停止", "voyage.resume": "航海を再開", "voyage.instruction": "魚を追ってクリック。体力0で捕獲。", "voyage.full": "船倉満杯。船体か保冷箱を強化。", "voyage.codexWait": "Codexが待っています", "voyage.paused": "航海停止中", "voyage.codexCopy": "作業後に戻ってください", "voyage.resumeCopy": "右上から再開", "voyage.summary": "航海結果", "voyage.fullReturn": "獲物を積んで帰港", "voyage.emptyReturn": "空荷で帰港", "voyage.noCatch": "獲物なし。航海距離は記録されます。", "voyage.docking": "接岸中", "voyage.unload": "荷下ろし",
  "status.idle": "Codex 待機中", "status.idleCopy": "新しいタスクを同期", "status.running": "Codexタスク {count} 件実行中", "status.sail": "出航できます", "status.approval": "Codexが承認待ち", "status.finished": "Codexの作業完了", "status.paused": "航海停止中", "loading.title": "港を準備中", "loading.copy": "ローカルデータ読込中", "toast.close": "メッセージを閉じる",
  "error.power": "航力が足りません。", "error.coins": "コインが足りません。", "error.storage": "容量不足です。先に強化してください。", "error.cargo": "貨物が足りません。", "error.locked": "開放条件を満たしていません。", "error.busy": "この航海中は操作できません。", "error.max": "最大レベルです。", "error.action": "現在この操作は使えません。"
};

const ko = {
  "resource.power": "항해력", "resource.coins": "코인", "resource.distance": "항해 거리", "unit.nm": "해리", "unit.seconds": "초", "unit.slots": "칸", "unit.fish": "마리", "unit.damage": "피해",
  "top.harbor": "항구", "top.level": "항구 레벨", "nav.menu": "게임 메뉴", "nav.harbor": "항구", "nav.voyages": "항로", "nav.warehouse": "창고", "nav.orders": "주문", "nav.progression": "성장", "nav.settings": "설정",
  "port.open": " 개방", "port.building": " 건설 중", "port.berthOpen": "선석 개방", "world.map": "{period}·{weather} 항구 지도", "world.voyage": "{period}·{weather} 항해", "environment.visibility": "시야 {value}",
  "port.eyebrow": "항구 건설", "port.openStatus": "선석 개방", "port.openCopy": "유도등 정상. 선단이 출항할 수 있습니다.", "port.next": "다음 항구", "port.progress": "건설 진행", "port.allocate": "항해력 배분", "port.decrease": "항해력 감소", "port.increase": "항해력 증가", "port.invest": "항해력 {value} 투입", "port.advanced": "건설 진행됨", "port.keep": "남은 항해력은 계속 보관됩니다.",
  "voyage.eyebrow": "선단 운용", "voyage.choose": "항로 선택", "voyage.cooler": "보냉함 {value}", "voyage.cargo": "화물칸 {value} kg", "voyage.portLocked": "항구 잠김", "voyage.lighthouseLock": "등대 LV.{level}", "voyage.vesselLock": "선박 등급 {level}", "voyage.routeMeta": "{seconds}초 · {distance}해리", "voyage.cost": "항해력 {value}", "voyage.sailing": "항해 중",
  "warehouse.eyebrow": "부두 창고", "warehouse.title": "냉장 어획물", "warehouse.cold": "냉동고 {stored} / {capacity}", "warehouse.price": "가격 ×{value}", "warehouse.note": "주문 납품 또는 낱개 판매가 가능합니다.",
  "orders.eyebrow": "항구 주문", "orders.title": "화물 납품", "orders.done": "납품 완료", "orders.deliver": "납품", "orders.short": "어획물 부족",
  "progress.eyebrow": "장기 성장", "progress.title": "선단과 항구", "progress.tabs": "성장 분류", "progress.fleet": "선단", "progress.equipment": "장비", "progress.crew": "선원", "progress.harbor": "어항", "progress.active": "현역", "progress.use": "사용", "progress.berthShort": "선석 부족", "progress.lighthouseNeed": "등대 LV.{level} 필요", "progress.activeShip": "현역", "progress.berths": "선석", "progress.coastal": "연안 사양", "progress.school": "어군 +{value}", "progress.net": "어망", "progress.voyage": "항해", "progress.rarity": "희귀 보너스", "progress.cold": "냉동고", "progress.market": "시장", "progress.max": "MAX",
  "facility.berthValue": "선석 {value}개", "facility.coldValue": "용량 {value}", "facility.marketValue": "가격 ×{value}", "facility.lightValue": "해역 등급 {value}",
  "settings.eyebrow": "환경 설정", "settings.title": "언어", "settings.copy": "즉시 적용되고 저장됩니다.", "settings.list": "표시 언어", "settings.selected": "현재 언어",
  "onboarding.label": "빠른 안내", "onboarding.welcomeTitle": "승선을 환영합니다", "onboarding.welcomeBody": "먼저 언어를 선택하세요. 설정에서 언제든 바꿀 수 있습니다.", "onboarding.powerTitle": "작업으로 항해력 획득", "onboarding.powerBody": "Codex에서 사용한 토큰은 조용히 항해력으로 저장됩니다. 사용할 때는 직접 정합니다.", "onboarding.harborTitle": "모든 프로젝트, 하나의 항구", "onboarding.harborBody": "모든 Codex 프로젝트가 같은 항구를 키웁니다. 항해력을 투입해 새 항구를 엽니다.", "onboarding.routeTitle": "수동 항해가 중심", "onboarding.routeBody": "항해력을 사용해 항로를 고릅니다. 먼 바다일수록 희귀한 물고기와 좋은 배가 필요합니다.", "onboarding.catchTitle": "쫓아서 포획", "onboarding.catchBody": "물고기는 갑자기 가속합니다. 따라가며 클릭해 체력을 0으로 만드세요.", "onboarding.codexTitle": "작업이 항상 우선", "onboarding.codexBody": "Codex가 승인 대기 또는 작업 완료가 되면 수동 항해가 멈춥니다. 처리 후 돌아오세요.", "onboarding.skip": "건너뛰기", "onboarding.back": "이전", "onboarding.next": "다음", "onboarding.finish": "항구 시작", "onboarding.replay": "안내 다시 보기",
  "fish.aria": "{name}, {rarity}, 체력 {hp}/{max}", "fish.caught": "{name} 포획", "fish.hit": "명중 -{damage}",
  "voyage.done": "항해 완료", "voyage.catch": "포획 {caught} / {total}", "voyage.pause": "항해 일시정지", "voyage.resume": "항해 재개", "voyage.instruction": "물고기를 쫓아 클릭. 체력 0이면 포획.", "voyage.full": "화물칸 만재. 선체나 보냉함을 강화하세요.", "voyage.codexWait": "Codex가 기다립니다", "voyage.paused": "항해 정지", "voyage.codexCopy": "작업 후 돌아오세요", "voyage.resumeCopy": "오른쪽 위에서 재개", "voyage.summary": "항해 결과", "voyage.fullReturn": "어획물 싣고 귀항", "voyage.emptyReturn": "빈 배로 귀항", "voyage.noCatch": "포획 없음. 항해 거리는 기록됩니다.", "voyage.docking": "접안 중", "voyage.unload": "하역하기",
  "status.idle": "Codex 대기", "status.idleCopy": "새 작업이 여기 동기화됩니다", "status.running": "Codex 작업 {count}개 처리 중", "status.sail": "출항할 수 있습니다", "status.approval": "Codex 승인 대기", "status.finished": "Codex 작업 완료", "status.paused": "항해 정지", "loading.title": "항구 준비 중", "loading.copy": "로컬 저장 불러오는 중", "toast.close": "메시지 닫기",
  "error.power": "항력이 부족합니다.", "error.coins": "코인이 부족합니다.", "error.storage": "용량이 부족합니다. 먼저 강화하세요.", "error.cargo": "화물이 부족합니다.", "error.locked": "개방 조건을 충족하지 못했습니다.", "error.busy": "현재 항해 중에는 사용할 수 없습니다.", "error.max": "최고 레벨입니다.", "error.action": "현재 사용할 수 없는 작업입니다."
};

const voyageFlowMessages = {
  en: {
    "onboarding.routeBody": "Manual 90-second voyages are the main game. Spare ships can run 30% support voyages.", "onboarding.codexBody": "Manual voyages pause when Codex needs you. Automated ships keep sailing in the background.",
    "voyage.manualTitle": "Go Fishing", "voyage.modeLabel": "Voyage mode", "voyage.manual": "Go Fishing", "voyage.auto": "Fleet Dispatch", "voyage.ninetySeconds": "About 90 seconds", "voyage.returnAnytime": "Return anytime and keep your catch.", "voyage.depart": "Sail · {value}", "voyage.returnNow": "Return to harbor now", "voyage.return": "Return",
    "auto.title": "Fleet Dispatch", "auto.ruleTitle": "Support income", "auto.ruleCopy": "Spare ships bring a smaller haul and never catch legendary fish.", "auto.efficiency": "30%", "auto.materials": "Materials {value}", "auto.codexContinues": "Keeps sailing while Codex waits", "auto.noSpare": "No spare ship", "auto.noSpareCopy": "Buy another vessel and expand berths to unlock dispatch.", "auto.idle": "Ready for orders", "auto.returned": "Returned", "auto.atSea": "At sea", "auto.available": "Available", "auto.ready": "Cargo ready", "auto.timeLeft": "{seconds}s left", "auto.collect": "Collect cargo", "auto.sailing": "Voyage underway", "auto.routeFor": "Route for {vessel}", "auto.dispatch": "Dispatch", "auto.noRoute": "No route"
  },
  "pt-BR": {
    "onboarding.routeBody": "Viagens manuais de 90 segundos são o foco. Navios extras rendem 30% em apoio.", "onboarding.codexBody": "A viagem manual pausa quando o Codex chama. Navios automáticos continuam.",
    "voyage.manualTitle": "Ir Pescar", "voyage.modeLabel": "Modo de viagem", "voyage.manual": "Ir Pescar", "voyage.auto": "Enviar Frota", "voyage.ninetySeconds": "Cerca de 90 segundos", "voyage.returnAnytime": "Volte quando quiser e guarde a pesca.", "voyage.depart": "Partir · {value}", "voyage.returnNow": "Voltar ao porto agora", "voyage.return": "Voltar",
    "auto.title": "Enviar Frota", "auto.ruleTitle": "Renda auxiliar", "auto.ruleCopy": "Navios extras trazem menos carga e nunca pescam lendários.", "auto.efficiency": "30%", "auto.materials": "Materiais {value}", "auto.codexContinues": "Continua durante esperas do Codex", "auto.noSpare": "Sem navio extra", "auto.noSpareCopy": "Compre outro navio e amplie o cais.", "auto.idle": "Aguardando ordens", "auto.returned": "Retornou", "auto.atSea": "No mar", "auto.available": "Disponível", "auto.ready": "Carga pronta", "auto.timeLeft": "Faltam {seconds}s", "auto.collect": "Receber carga", "auto.sailing": "Viagem em curso", "auto.routeFor": "Rota de {vessel}", "auto.dispatch": "Enviar", "auto.noRoute": "Sem rota"
  },
  de: {
    "onboarding.routeBody": "90-Sekunden-Fahrten sind das Hauptspiel. Zusatzschiffe liefern 30% Nebenertrag.", "onboarding.codexBody": "Manuelle Fahrten pausieren für Codex. Automatikschiffe fahren weiter.",
    "voyage.manualTitle": "Selbst Fischen", "voyage.modeLabel": "Fahrtmodus", "voyage.manual": "Selbst Fischen", "voyage.auto": "Flotte Senden", "voyage.ninetySeconds": "Etwa 90 Sekunden", "voyage.returnAnytime": "Jederzeit mit dem Fang zurückkehren.", "voyage.depart": "Ablegen · {value}", "voyage.returnNow": "Jetzt zum Hafen zurück", "voyage.return": "Zurück",
    "auto.title": "Flotte Senden", "auto.ruleTitle": "Nebenertrag", "auto.ruleCopy": "Zusatzschiffe bringen weniger und nie legendäre Fische.", "auto.efficiency": "30%", "auto.materials": "Material {value}", "auto.codexContinues": "Fährt bei Codex-Wartezeit weiter", "auto.noSpare": "Kein freies Schiff", "auto.noSpareCopy": "Weiteres Schiff kaufen und Liegeplätze ausbauen.", "auto.idle": "Bereit", "auto.returned": "Zurück", "auto.atSea": "Auf See", "auto.available": "Verfügbar", "auto.ready": "Ladung bereit", "auto.timeLeft": "Noch {seconds}s", "auto.collect": "Ladung holen", "auto.sailing": "Fahrt läuft", "auto.routeFor": "Route für {vessel}", "auto.dispatch": "Senden", "auto.noRoute": "Keine Route"
  },
  fr: {
    "onboarding.routeBody": "Les sorties manuelles de 90 s sont centrales. Les navires libres rapportent 30% en soutien.", "onboarding.codexBody": "La sortie manuelle se met en pause pour Codex. Les navires automatiques continuent.",
    "voyage.manualTitle": "Partir Pêcher", "voyage.modeLabel": "Mode de sortie", "voyage.manual": "Partir Pêcher", "voyage.auto": "Envoyer Flotte", "voyage.ninetySeconds": "Environ 90 secondes", "voyage.returnAnytime": "Rentrez à tout moment avec vos prises.", "voyage.depart": "Partir · {value}", "voyage.returnNow": "Rentrer au port maintenant", "voyage.return": "Rentrer",
    "auto.title": "Envoyer Flotte", "auto.ruleTitle": "Revenu d'appoint", "auto.ruleCopy": "Les navires libres rapportent moins, sans poisson légendaire.", "auto.efficiency": "30%", "auto.materials": "Matériaux {value}", "auto.codexContinues": "Continue pendant l'attente de Codex", "auto.noSpare": "Aucun navire libre", "auto.noSpareCopy": "Achetez un navire et agrandissez les quais.", "auto.idle": "Prêt", "auto.returned": "De retour", "auto.atSea": "En mer", "auto.available": "Disponible", "auto.ready": "Cargaison prête", "auto.timeLeft": "Reste {seconds}s", "auto.collect": "Récupérer", "auto.sailing": "Sortie en cours", "auto.routeFor": "Route de {vessel}", "auto.dispatch": "Envoyer", "auto.noRoute": "Aucune route"
  },
  ja: {
    "onboarding.routeBody": "約90秒の手動航海が中心です。予備船は30%効率で補助航海できます。", "onboarding.codexBody": "Codexが必要な時は手動航海が停止。自動船は航行を続けます。",
    "voyage.manualTitle": "自分で漁へ", "voyage.modeLabel": "航海モード", "voyage.manual": "自分で漁へ", "voyage.auto": "船団派遣", "voyage.ninetySeconds": "約90秒", "voyage.returnAnytime": "いつでも帰港し、獲物を持ち帰れます。", "voyage.depart": "出航 · {value}", "voyage.returnNow": "今すぐ港へ戻る", "voyage.return": "帰港",
    "auto.title": "船団派遣", "auto.ruleTitle": "補助収入", "auto.ruleCopy": "予備船は収穫が少なく、伝説魚は捕れません。", "auto.efficiency": "30%", "auto.materials": "素材 {value}", "auto.codexContinues": "Codex待機中も航行", "auto.noSpare": "予備船なし", "auto.noSpareCopy": "船を購入し、係留所を拡張してください。", "auto.idle": "命令待ち", "auto.returned": "帰港済み", "auto.atSea": "航海中", "auto.available": "派遣可能", "auto.ready": "貨物準備完了", "auto.timeLeft": "残り{seconds}秒", "auto.collect": "貨物を受取る", "auto.sailing": "航海中", "auto.routeFor": "{vessel}の航路", "auto.dispatch": "派遣", "auto.noRoute": "航路なし"
  },
  ko: {
    "onboarding.routeBody": "약 90초의 수동 항해가 중심입니다. 예비선은 30% 효율로 보조 항해합니다.", "onboarding.codexBody": "Codex가 부르면 수동 항해만 멈추고 자동선은 계속 항해합니다.",
    "voyage.manualTitle": "직접 출항", "voyage.modeLabel": "항해 모드", "voyage.manual": "직접 출항", "voyage.auto": "선단 파견", "voyage.ninetySeconds": "약 90초", "voyage.returnAnytime": "언제든 귀항해 잡은 물고기를 보관합니다.", "voyage.depart": "출항 · {value}", "voyage.returnNow": "지금 항구로 귀환", "voyage.return": "귀항",
    "auto.title": "선단 파견", "auto.ruleTitle": "보조 수익", "auto.ruleCopy": "예비선은 적게 잡으며 전설 물고기는 잡지 못합니다.", "auto.efficiency": "30%", "auto.materials": "재료 {value}", "auto.codexContinues": "Codex 대기 중에도 항해", "auto.noSpare": "예비선 없음", "auto.noSpareCopy": "배를 사고 선석을 확장하세요.", "auto.idle": "명령 대기", "auto.returned": "귀항 완료", "auto.atSea": "항해 중", "auto.available": "파견 가능", "auto.ready": "화물 준비", "auto.timeLeft": "{seconds}초 남음", "auto.collect": "화물 받기", "auto.sailing": "항해 진행 중", "auto.routeFor": "{vessel} 항로", "auto.dispatch": "파견", "auto.noRoute": "항로 없음"
  },
  "zh-Hans": {
    "onboarding.routeBody": "约 90 秒的手动航程是主玩法；副船可按 30% 效率执行辅助航程。", "onboarding.codexBody": "Codex 需要你时手动航程会暂停；自动船仍会继续航行。",
    "voyage.manualTitle": "亲自出海", "voyage.modeLabel": "航行模式", "voyage.manual": "亲自出海", "voyage.auto": "船队派遣", "voyage.ninetySeconds": "约 90 秒", "voyage.returnAnytime": "可随时提前回港，并保留已捕获鱼货。", "voyage.depart": "出航 · {value}", "voyage.returnNow": "立即返回港口", "voyage.return": "回港",
    "auto.title": "船队派遣", "auto.ruleTitle": "辅助收入", "auto.ruleCopy": "副船收益较少，而且无法捕获传说鱼。", "auto.efficiency": "30%", "auto.materials": "材料 {value}", "auto.codexContinues": "Codex 等待时仍会继续", "auto.noSpare": "暂无副船", "auto.noSpareCopy": "购买其他船只并扩建泊位后即可派遣。", "auto.idle": "等待指令", "auto.returned": "已回港", "auto.atSea": "航行中", "auto.available": "可派遣", "auto.ready": "货物待领取", "auto.timeLeft": "剩余 {seconds} 秒", "auto.collect": "领取货物", "auto.sailing": "航行进行中", "auto.routeFor": "{vessel} 的航线", "auto.dispatch": "派遣", "auto.noRoute": "暂无航线"
  },
  "zh-Hant": {
    "onboarding.routeBody": "約 90 秒的手動航程是主玩法；副船可按 30% 效率執行輔助航程。", "onboarding.codexBody": "Codex 需要你時手動航程會暫停；自動船仍會繼續航行。",
    "voyage.manualTitle": "親自出海", "voyage.modeLabel": "航行模式", "voyage.manual": "親自出海", "voyage.auto": "船隊派遣", "voyage.ninetySeconds": "約 90 秒", "voyage.returnAnytime": "可隨時提早回港，並保留已捕獲魚貨。", "voyage.depart": "出航 · {value}", "voyage.returnNow": "立即返回港口", "voyage.return": "回港",
    "auto.title": "船隊派遣", "auto.ruleTitle": "輔助收入", "auto.ruleCopy": "副船收益較少，而且無法捕獲傳說魚。", "auto.efficiency": "30%", "auto.materials": "材料 {value}", "auto.codexContinues": "Codex 等待時仍會繼續", "auto.noSpare": "暫無副船", "auto.noSpareCopy": "購買其他船隻並擴建泊位後即可派遣。", "auto.idle": "等待指令", "auto.returned": "已回港", "auto.atSea": "航行中", "auto.available": "可派遣", "auto.ready": "貨物待領取", "auto.timeLeft": "剩餘 {seconds} 秒", "auto.collect": "領取貨物", "auto.sailing": "航行進行中", "auto.routeFor": "{vessel} 的航線", "auto.dispatch": "派遣", "auto.noRoute": "暫無航線"
  }
};

const threatMessages = {
  en: {
    "progress.cannon": "Cannon", "ship.healthValue": "Hull {hp}/{max}", "repair.required": "Repair first", "repair.short": "Repair", "repair.button": "Repair · {value}",
    "pirate.name": "Pirate Raider", "pirate.aria": "Pirate ship, health {hp}/{max}", "pirate.attackIn": "Fires in {seconds}s", "pirate.instruction": "Click the raider to fire · {damage} damage", "pirate.defeated": "Pirates repelled",
    "wreck.hurricaneAlert": "HURRICANE", "wreck.pirateAlert": "SHIP LOST", "wreck.title": "Vessel wrecked", "wreck.hurricane": "A hurricane destroyed the vessel.", "wreck.pirates": "The raiders destroyed the vessel.", "wreck.lost": "All voyage catch was lost.", "wreck.tow": "Tow to harbor", "wreck.towShort": "Tow"
  },
  "pt-BR": {
    "progress.cannon": "Canhão", "ship.healthValue": "Casco {hp}/{max}", "repair.required": "Repare primeiro", "repair.short": "Reparar", "repair.button": "Reparar · {value}",
    "pirate.name": "Navio Pirata", "pirate.aria": "Navio pirata, vida {hp}/{max}", "pirate.attackIn": "Atira em {seconds}s", "pirate.instruction": "Clique para atirar · {damage} dano", "pirate.defeated": "Piratas repelidos",
    "wreck.hurricaneAlert": "FURACÃO", "wreck.pirateAlert": "NAVIO PERDIDO", "wreck.title": "Navio destruído", "wreck.hurricane": "Um furacão destruiu o navio.", "wreck.pirates": "Os piratas destruíram o navio.", "wreck.lost": "Toda a pesca foi perdida.", "wreck.tow": "Rebocar ao porto", "wreck.towShort": "Rebocar"
  },
  de: {
    "progress.cannon": "Kanone", "ship.healthValue": "Rumpf {hp}/{max}", "repair.required": "Erst reparieren", "repair.short": "Reparatur", "repair.button": "Reparatur · {value}",
    "pirate.name": "Piratenschiff", "pirate.aria": "Piratenschiff, Leben {hp}/{max}", "pirate.attackIn": "Feuert in {seconds}s", "pirate.instruction": "Klicken zum Feuern · {damage} Schaden", "pirate.defeated": "Piraten vertrieben",
    "wreck.hurricaneAlert": "ORKAN", "wreck.pirateAlert": "SCHIFF VERLOREN", "wreck.title": "Schiff zerstört", "wreck.hurricane": "Ein Orkan zerstörte das Schiff.", "wreck.pirates": "Die Piraten zerstörten das Schiff.", "wreck.lost": "Der gesamte Fang ist verloren.", "wreck.tow": "Zum Hafen schleppen", "wreck.towShort": "Schleppen"
  },
  fr: {
    "progress.cannon": "Canon", "ship.healthValue": "Coque {hp}/{max}", "repair.required": "Réparer d'abord", "repair.short": "Réparer", "repair.button": "Réparer · {value}",
    "pirate.name": "Navire pirate", "pirate.aria": "Navire pirate, vie {hp}/{max}", "pirate.attackIn": "Tir dans {seconds}s", "pirate.instruction": "Cliquez pour tirer · {damage} dégâts", "pirate.defeated": "Pirates repoussés",
    "wreck.hurricaneAlert": "OURAGAN", "wreck.pirateAlert": "NAVIRE PERDU", "wreck.title": "Navire détruit", "wreck.hurricane": "Un ouragan a détruit le navire.", "wreck.pirates": "Les pirates ont détruit le navire.", "wreck.lost": "Toute la pêche est perdue.", "wreck.tow": "Remorquer au port", "wreck.towShort": "Remorquer"
  },
  ja: {
    "progress.cannon": "大砲", "ship.healthValue": "船体 {hp}/{max}", "repair.required": "先に修理", "repair.short": "修理", "repair.button": "修理 · {value}",
    "pirate.name": "海賊船", "pirate.aria": "海賊船、耐久 {hp}/{max}", "pirate.attackIn": "{seconds}秒後に砲撃", "pirate.instruction": "クリックで砲撃 · ダメージ {damage}", "pirate.defeated": "海賊を撃退",
    "wreck.hurricaneAlert": "ハリケーン", "wreck.pirateAlert": "船を喪失", "wreck.title": "船が大破", "wreck.hurricane": "ハリケーンで船が大破しました。", "wreck.pirates": "海賊に船を破壊されました。", "wreck.lost": "今回の漁獲は全て失われました。", "wreck.tow": "港へ曳航", "wreck.towShort": "曳航"
  },
  ko: {
    "progress.cannon": "대포", "ship.healthValue": "선체 {hp}/{max}", "repair.required": "먼저 수리", "repair.short": "수리", "repair.button": "수리 · {value}",
    "pirate.name": "해적선", "pirate.aria": "해적선, 체력 {hp}/{max}", "pirate.attackIn": "{seconds}초 후 발사", "pirate.instruction": "클릭해서 발사 · 피해 {damage}", "pirate.defeated": "해적 격퇴",
    "wreck.hurricaneAlert": "허리케인", "wreck.pirateAlert": "선박 손실", "wreck.title": "선박 파손", "wreck.hurricane": "허리케인으로 선박이 파손됐습니다.", "wreck.pirates": "해적에게 선박이 파괴됐습니다.", "wreck.lost": "이번 항해의 어획물을 모두 잃었습니다.", "wreck.tow": "항구로 견인", "wreck.towShort": "견인"
  },
  "zh-Hans": {
    "progress.cannon": "大炮", "ship.healthValue": "船体 {hp}/{max}", "repair.required": "请先维修", "repair.short": "维修", "repair.button": "维修 · {value}",
    "pirate.name": "海盗船", "pirate.aria": "海盗船，生命 {hp}/{max}", "pirate.attackIn": "{seconds} 秒后开火", "pirate.instruction": "点击海盗船开炮 · 伤害 {damage}", "pirate.defeated": "已击退海盗",
    "wreck.hurricaneAlert": "飓风来袭", "wreck.pirateAlert": "船只损毁", "wreck.title": "渔船损毁", "wreck.hurricane": "飓风摧毁了渔船。", "wreck.pirates": "海盗摧毁了渔船。", "wreck.lost": "本次航程的鱼货全部丢失。", "wreck.tow": "拖回港口维修", "wreck.towShort": "拖回"
  },
  "zh-Hant": {
    "progress.cannon": "大炮", "ship.healthValue": "船體 {hp}/{max}", "repair.required": "請先維修", "repair.short": "維修", "repair.button": "維修 · {value}",
    "pirate.name": "海盜船", "pirate.aria": "海盜船，生命 {hp}/{max}", "pirate.attackIn": "{seconds} 秒後開火", "pirate.instruction": "點擊海盜船開炮 · 傷害 {damage}", "pirate.defeated": "已擊退海盜",
    "wreck.hurricaneAlert": "颶風來襲", "wreck.pirateAlert": "船隻損毀", "wreck.title": "漁船損毀", "wreck.hurricane": "颶風摧毀了漁船。", "wreck.pirates": "海盜摧毀了漁船。", "wreck.lost": "本次航程的魚貨全部失去。", "wreck.tow": "拖回港口維修", "wreck.towShort": "拖回"
  }
};

const orderFlowMessages = {
  en: {
    "orders.completed": "Completed", "orders.market": "Market bonus", "orders.refresh": "Refresh", "orders.refreshIn": "Refresh in {time}", "orders.deliveredReward": "Order delivered · +{value} coins",
    "orders.tier.standard": "STANDARD", "orders.tier.priority": "PRIORITY", "orders.tier.premium": "PREMIUM", "orders.stock": "Stored {owned} / Need {needed}"
  },
  "pt-BR": {
    "orders.completed": "Concluídos", "orders.market": "Bônus", "orders.refresh": "Atualizar", "orders.refreshIn": "Atualiza em {time}", "orders.deliveredReward": "Pedido entregue · +{value} moedas",
    "orders.tier.standard": "PADRÃO", "orders.tier.priority": "PRIORIDADE", "orders.tier.premium": "PREMIUM", "orders.stock": "Estoque {owned} / Pede {needed}"
  },
  de: {
    "orders.completed": "Erledigt", "orders.market": "Marktbonus", "orders.refresh": "Neu laden", "orders.refreshIn": "Neu in {time}", "orders.deliveredReward": "Auftrag geliefert · +{value} Münzen",
    "orders.tier.standard": "STANDARD", "orders.tier.priority": "EILAUFTRAG", "orders.tier.premium": "PREMIUM", "orders.stock": "Lager {owned} / Bedarf {needed}"
  },
  fr: {
    "orders.completed": "Terminées", "orders.market": "Bonus marché", "orders.refresh": "Actualiser", "orders.refreshIn": "Dans {time}", "orders.deliveredReward": "Commande livrée · +{value} pièces",
    "orders.tier.standard": "STANDARD", "orders.tier.priority": "PRIORITAIRE", "orders.tier.premium": "PREMIUM", "orders.stock": "Stock {owned} / Requis {needed}"
  },
  ja: {
    "orders.completed": "完了数", "orders.market": "市場ボーナス", "orders.refresh": "更新", "orders.refreshIn": "更新まで {time}", "orders.deliveredReward": "注文を納品 · +{value} コイン",
    "orders.tier.standard": "通常", "orders.tier.priority": "優先", "orders.tier.premium": "特選", "orders.stock": "在庫 {owned} / 必要 {needed}"
  },
  ko: {
    "orders.completed": "완료", "orders.market": "시장 보너스", "orders.refresh": "새로고침", "orders.refreshIn": "{time} 후 갱신", "orders.deliveredReward": "주문 납품 · +{value} 코인",
    "orders.tier.standard": "일반", "orders.tier.priority": "우선", "orders.tier.premium": "특선", "orders.stock": "보유 {owned} / 필요 {needed}"
  },
  "zh-Hans": {
    "orders.completed": "已完成", "orders.market": "市场加成", "orders.refresh": "刷新", "orders.refreshIn": "{time} 后刷新", "orders.deliveredReward": "订单已交付 · +{value} 金币",
    "orders.tier.standard": "普通订单", "orders.tier.priority": "优先订单", "orders.tier.premium": "精品订单", "orders.stock": "库存 {owned} / 需要 {needed}"
  },
  "zh-Hant": {
    "orders.completed": "已完成", "orders.market": "市場加成", "orders.refresh": "刷新", "orders.refreshIn": "{time} 後刷新", "orders.deliveredReward": "訂單已交付 · +{value} 金幣",
    "orders.tier.standard": "普通訂單", "orders.tier.priority": "優先訂單", "orders.tier.premium": "精品訂單", "orders.stock": "庫存 {owned} / 需要 {needed}"
  }
};

const progressionFixMessages = {
  en: { "progress.nextVoyage": "Applies next voyage", "progress.inPort": "Upgrade in port", "facility.lightMax": "Rare +12% · voyage -10%" },
  "pt-BR": { "progress.nextVoyage": "Vale na próxima viagem", "progress.inPort": "Melhore no porto", "facility.lightMax": "Raros +12% · viagem -10%" },
  de: { "progress.nextVoyage": "Ab nächster Fahrt", "progress.inPort": "Im Hafen ausbauen", "facility.lightMax": "Selten +12% · Fahrt -10%" },
  fr: { "progress.nextVoyage": "Dès la prochaine sortie", "progress.inPort": "Améliorer au port", "facility.lightMax": "Rareté +12% · sortie -10%" },
  ja: { "progress.nextVoyage": "次の航海から有効", "progress.inPort": "港で強化", "facility.lightMax": "レア +12% · 航海 -10%" },
  ko: { "progress.nextVoyage": "다음 항해부터 적용", "progress.inPort": "항구에서 강화", "facility.lightMax": "희귀 +12% · 항해 -10%" },
  "zh-Hans": { "progress.nextVoyage": "下次航程生效", "progress.inPort": "回港后升级", "facility.lightMax": "稀有 +12% · 航程 -10%" },
  "zh-Hant": { "progress.nextVoyage": "下次航程生效", "progress.inPort": "回港後升級", "facility.lightMax": "稀有 +12% · 航程 -10%" }
};

const progressionScaleMessages = {
  en: { "progress.nextPort": "NEXT PORT", "progress.portCap": "Current waters cap LV.{level}", "facility.lightBonus": "Rare +{rarity}% · voyage -{voyage}%" },
  "pt-BR": { "progress.nextPort": "NOVO PORTO", "progress.portCap": "Limite atual NV.{level}", "facility.lightBonus": "Raros +{rarity}% · viagem -{voyage}%" },
  de: { "progress.nextPort": "NEUER HAFEN", "progress.portCap": "Aktuelles Limit LV.{level}", "facility.lightBonus": "Selten +{rarity}% · Fahrt -{voyage}%" },
  fr: { "progress.nextPort": "NOUV. PORT", "progress.portCap": "Limite actuelle NV.{level}", "facility.lightBonus": "Rareté +{rarity}% · sortie -{voyage}%" },
  ja: { "progress.nextPort": "次の港", "progress.portCap": "現在の海域上限 LV.{level}", "facility.lightBonus": "レア +{rarity}% · 航海 -{voyage}%" },
  ko: { "progress.nextPort": "다음 항구", "progress.portCap": "현재 해역 한도 LV.{level}", "facility.lightBonus": "희귀 +{rarity}% · 항해 -{voyage}%" },
  "zh-Hans": { "progress.nextPort": "下一港口", "progress.portCap": "当前海域上限 LV.{level}", "facility.lightBonus": "稀有 +{rarity}% · 航程 -{voyage}%" },
  "zh-Hant": { "progress.nextPort": "下一港口", "progress.portCap": "目前海域上限 LV.{level}", "facility.lightBonus": "稀有 +{rarity}% · 航程 -{voyage}%" }
};

const fleetFlowMessages = {
  en: {
    "fleet.manage": "Choose vessel to manage", "fleet.number": "Ship {number}", "fleet.manualShip": "Manual vessel", "fleet.selectedShip": "Managing", "fleet.manual": "Manual", "fleet.automatic": "Auto", "fleet.idle": "Idle", "fleet.evolution": "Refit path", "fleet.finalClass": "Final class", "fleet.setManual": "Set for manual", "fleet.upgradeTo": "Refit to {name}", "fleet.returnToUpgrade": "Return this ship to port before refitting.", "fleet.build": "Build new skiff", "fleet.newCopy": "New hull · all gear LV.1", "fleet.upgrading": "Upgrading", "auto.noSpareCopy": "Expand berths, then build a new skiff."
  },
  "pt-BR": {
    "fleet.manage": "Escolher navio", "fleet.number": "Navio {number}", "fleet.manualShip": "Navio manual", "fleet.selectedShip": "Em gestão", "fleet.manual": "Manual", "fleet.automatic": "Auto", "fleet.idle": "Livre", "fleet.evolution": "Linha de reforma", "fleet.finalClass": "Classe final", "fleet.setManual": "Usar manual", "fleet.upgradeTo": "Reformar: {name}", "fleet.returnToUpgrade": "Traga este navio ao porto para reformar.", "fleet.build": "Construir barco", "fleet.newCopy": "Casco novo · equip. NV.1", "fleet.upgrading": "Evoluindo", "auto.noSpareCopy": "Amplie o cais e construa um barco novo."
  },
  de: {
    "fleet.manage": "Schiff verwalten", "fleet.number": "Schiff {number}", "fleet.manualShip": "Manuelles Schiff", "fleet.selectedShip": "In Verwaltung", "fleet.manual": "Manuell", "fleet.automatic": "Auto", "fleet.idle": "Frei", "fleet.evolution": "Ausbaupfad", "fleet.finalClass": "Endklasse", "fleet.setManual": "Manuell nutzen", "fleet.upgradeTo": "Ausbau: {name}", "fleet.returnToUpgrade": "Dieses Schiff muss für den Ausbau im Hafen sein.", "fleet.build": "Kahn bauen", "fleet.newCopy": "Neuer Rumpf · Ausrüstung LV.1", "fleet.upgrading": "Ausbau für", "auto.noSpareCopy": "Liegeplatz ausbauen und neuen Kahn bauen."
  },
  fr: {
    "fleet.manage": "Choisir le navire", "fleet.number": "Navire {number}", "fleet.manualShip": "Navire manuel", "fleet.selectedShip": "En gestion", "fleet.manual": "Manuel", "fleet.automatic": "Auto", "fleet.idle": "Libre", "fleet.evolution": "Ligne d'évolution", "fleet.finalClass": "Classe finale", "fleet.setManual": "Utiliser manuel", "fleet.upgradeTo": "Évoluer en {name}", "fleet.returnToUpgrade": "Ramenez ce navire au port pour l'améliorer.", "fleet.build": "Construire barque", "fleet.newCopy": "Coque neuve · équipement NV.1", "fleet.upgrading": "Amélioration", "auto.noSpareCopy": "Agrandissez le quai et construisez une barque."
  },
  ja: {
    "fleet.manage": "管理する船を選択", "fleet.number": "船 {number}", "fleet.manualShip": "手動出航船", "fleet.selectedShip": "管理中", "fleet.manual": "手動", "fleet.automatic": "自動", "fleet.idle": "待機", "fleet.evolution": "改装ルート", "fleet.finalClass": "最終船型", "fleet.setManual": "手動船に設定", "fleet.upgradeTo": "{name}へ改装", "fleet.returnToUpgrade": "改装するには港へ戻してください。", "fleet.build": "小型漁船を建造", "fleet.newCopy": "新造船 · 全装備 LV.1", "fleet.upgrading": "装備強化中", "auto.noSpareCopy": "停泊地を広げ、小型漁船を建造します。"
  },
  ko: {
    "fleet.manage": "관리 선박 선택", "fleet.number": "선박 {number}", "fleet.manualShip": "수동 출항선", "fleet.selectedShip": "관리 중", "fleet.manual": "수동", "fleet.automatic": "자동", "fleet.idle": "대기", "fleet.evolution": "개조 경로", "fleet.finalClass": "최종 선형", "fleet.setManual": "수동선 설정", "fleet.upgradeTo": "{name}(으)로 개조", "fleet.returnToUpgrade": "개조하려면 항구로 귀환해야 합니다.", "fleet.build": "소형 어선 건조", "fleet.newCopy": "새 선체 · 모든 장비 LV.1", "fleet.upgrading": "장비 강화", "auto.noSpareCopy": "선석을 확장하고 소형 어선을 건조하세요."
  },
  "zh-Hans": {
    "fleet.manage": "选择要管理的船只", "fleet.number": "船只 {number}", "fleet.manualShip": "亲自出海船", "fleet.selectedShip": "正在管理", "fleet.manual": "主力", "fleet.automatic": "自动", "fleet.idle": "待命", "fleet.evolution": "船型升级路线", "fleet.finalClass": "最终船型", "fleet.setManual": "设为主力", "fleet.upgradeTo": "升级为{name}", "fleet.returnToUpgrade": "船只回港后才可升级。", "fleet.build": "建造新小渔船", "fleet.newCopy": "全新船体 · 全部设备 LV.1", "fleet.upgrading": "正在升级", "auto.noSpareCopy": "扩建泊位后，可建造一艘全新小渔船。"
  },
  "zh-Hant": {
    "fleet.manage": "選擇要管理的船隻", "fleet.number": "船隻 {number}", "fleet.manualShip": "親自出海船", "fleet.selectedShip": "正在管理", "fleet.manual": "主力", "fleet.automatic": "自動", "fleet.idle": "待命", "fleet.evolution": "船型升級路線", "fleet.finalClass": "最終船型", "fleet.setManual": "設為主力", "fleet.upgradeTo": "升級為{name}", "fleet.returnToUpgrade": "船隻回港後才可升級。", "fleet.build": "建造新小漁船", "fleet.newCopy": "全新船體 · 全部設備 LV.1", "fleet.upgrading": "正在升級", "auto.noSpareCopy": "擴建泊位後，可建造一艘全新小漁船。"
  }
};

const baseMessages = { en, "pt-BR": ptBR, de, fr, ja, ko, "zh-Hans": zhHans, "zh-Hant": zhHant };
const recoveryMessages = {
  en: { "recovery.save_recovered_from_backup": "The latest save was damaged. Token Harbor restored the verified backup.", "recovery.save_reset_after_corruption": "The save and backup were unreadable. Token Harbor quarantined them and opened a new harbor.", "recovery.dismiss": "Acknowledge recovery" },
  "pt-BR": { "recovery.save_recovered_from_backup": "O salvamento recente foi danificado. Token Harbor restaurou o backup verificado.", "recovery.save_reset_after_corruption": "O salvamento e o backup estavam ilegíveis. Token Harbor isolou os arquivos e abriu um novo porto.", "recovery.dismiss": "Confirmar recuperação" },
  de: { "recovery.save_recovered_from_backup": "Der letzte Spielstand war beschädigt. Token Harbor hat die geprüfte Sicherung wiederhergestellt.", "recovery.save_reset_after_corruption": "Spielstand und Sicherung waren unlesbar. Token Harbor hat sie isoliert und einen neuen Hafen geöffnet.", "recovery.dismiss": "Wiederherstellung bestätigen" },
  fr: { "recovery.save_recovered_from_backup": "La sauvegarde récente était endommagée. Token Harbor a restauré la sauvegarde vérifiée.", "recovery.save_reset_after_corruption": "La sauvegarde et sa copie étaient illisibles. Token Harbor les a isolées et a ouvert un nouveau port.", "recovery.dismiss": "Confirmer la récupération" },
  ja: { "recovery.save_recovered_from_backup": "最新のセーブが破損していたため、検証済みのバックアップを復元しました。", "recovery.save_reset_after_corruption": "セーブとバックアップを読み込めなかったため、隔離して新しい港を開きました。", "recovery.dismiss": "復元を確認" },
  ko: { "recovery.save_recovered_from_backup": "최근 저장 파일이 손상되어 검증된 백업을 복원했습니다.", "recovery.save_reset_after_corruption": "저장 파일과 백업을 읽을 수 없어 격리하고 새 항구를 열었습니다.", "recovery.dismiss": "복구 확인" },
  "zh-Hans": { "recovery.save_recovered_from_backup": "最近的存档已损坏，Token Harbor 已恢复经过验证的备份。", "recovery.save_reset_after_corruption": "存档与备份均无法读取，Token Harbor 已将其隔离并开启新港口。", "recovery.dismiss": "确认恢复" },
  "zh-Hant": { "recovery.save_recovered_from_backup": "最近的存檔已損壞，Token Harbor 已還原經驗證的備份。", "recovery.save_reset_after_corruption": "存檔與備份均無法讀取，Token Harbor 已將其隔離並開啟新港口。", "recovery.dismiss": "確認復原" }
};
export const MESSAGES = Object.fromEntries(Object.entries(baseMessages).map(([locale, dictionary]) => [
  locale,
  { ...dictionary, ...voyageFlowMessages[locale], ...threatMessages[locale], ...orderFlowMessages[locale], ...progressionFixMessages[locale], ...progressionScaleMessages[locale], ...fleetFlowMessages[locale], ...recoveryMessages[locale] }
]));

/** @param {readonly string[]} preferences */
export function resolvePreferredLanguage(preferences = []) {
  const exact = new Map(LANGUAGES.map((language) => [language.id.toLowerCase(), language.id]));
  for (const preference of preferences || []) {
    const locale = String(preference || "").replaceAll("_", "-").toLowerCase();
    if (!locale) continue;
    if (exact.has(locale)) return exact.get(locale);
    if (locale.startsWith("zh-")) {
      if (/(?:hant|tw|hk|mo)(?:-|$)/.test(locale)) return "zh-Hant";
      return "zh-Hans";
    }
    const primary = locale.split("-")[0];
    if (primary === "pt") return "pt-BR";
    if (["en", "de", "fr", "ja", "ko"].includes(primary)) return primary;
  }
  return "en";
}

export const ENTITY_TRANSLATIONS = {
  "zh-Hant": {
    port: { driftwood: "漂木港", coral: "珊瑚港", mist: "霧燈港" },
    route: { nearshore: "近岸巡航", coral: "珊瑚航線", abyss: "霧海深潛" }, routeHint: { nearshore: "普通魚為主", coral: "稀有機率提升", abyss: "可遇史詩與傳說" },
    fish: { silver_dart: "銀梭魚", coral_snapper: "珊瑚笛鯛", moonfin_tuna: "月鰭鮪", ghost_ray: "幽光魟", sunscale_oarfish: "日鱗皇帶魚" },
    rarity: { common: "普通", uncommon: "少見", rare: "稀有", epic: "史詩", legendary: "傳說" },
    vessel: { skiff: "小漁船", trawler: "拖網船", ocean: "遠洋船", deepsea: "深海船" },
    equipment: { engine: ["引擎", "航程時間每級縮短 6%"], net: ["漁網", "每 2 級增加 1 點捕魚傷害"], sonar: ["聲納", "高稀有度機率每級提升 6%"], cooler: ["保鮮箱", "船上容量每級增加 2 條"] },
    crew: { captain: ["船長", "提升高稀有度魚群機率"], fisher: ["漁夫", "每 2 級航程增加 1 條魚"], engineer: ["工程師", "航程時間每級縮短 4%"] },
    facility: { berth: ["泊位", "每級可停泊 1 艘船"], coldStorage: ["冷庫", "每級增加 20 條總容量"], market: ["市場", "每級提高 10% 魚貨售價"], lighthouse: ["燈塔", "解鎖更遠海域與大型船"] },
    order: { "morning-market": "晨市鮮魚", "reef-banquet": "珊瑚宴席", "collector-cooler": "深海收藏箱" }, period: { dawn: "日出", day: "中午", dusk: "黃昏", night: "夜晚" },
    weather: { clear: ["天晴", "東風 2 級", "12 海里"], cloudy: ["多雲", "海風 3 級", "9 海里"], fog: ["大霧", "微風 1 級", "2 海里"], rain: ["大雨", "東南風 4 級", "5 海里"], storm: ["雷雨", "強風 6 級", "3 海里"] }
  },
  "zh-Hans": {
    port: { driftwood: "漂木港", coral: "珊瑚港", mist: "雾灯港" }, route: { nearshore: "近岸巡航", coral: "珊瑚航线", abyss: "雾海深潜" }, routeHint: { nearshore: "普通鱼为主", coral: "稀有概率提升", abyss: "可遇史诗与传说" },
    fish: { silver_dart: "银梭鱼", coral_snapper: "珊瑚笛鲷", moonfin_tuna: "月鳍鲔", ghost_ray: "幽光鳐", sunscale_oarfish: "日鳞皇带鱼" }, rarity: { common: "普通", uncommon: "少见", rare: "稀有", epic: "史诗", legendary: "传说" }, vessel: { skiff: "小渔船", trawler: "拖网船", ocean: "远洋船", deepsea: "深海船" },
    equipment: { engine: ["引擎", "航程时间每级缩短 6%"], net: ["渔网", "每 2 级增加 1 点捕捞伤害"], sonar: ["声呐", "高稀有度概率每级提升 6%"], cooler: ["保鲜箱", "船上容量每级增加 2 条"] }, crew: { captain: ["船长", "提升高稀有度鱼群概率"], fisher: ["渔夫", "每 2 级航程增加 1 条鱼"], engineer: ["工程师", "航程时间每级缩短 4%"] }, facility: { berth: ["泊位", "每级可停泊 1 艘船"], coldStorage: ["冷库", "每级增加 20 条总容量"], market: ["市场", "每级提高 10% 鱼货售价"], lighthouse: ["灯塔", "解锁更远海域与大型船"] }, order: { "morning-market": "晨市鲜鱼", "reef-banquet": "珊瑚宴席", "collector-cooler": "深海收藏箱" }, period: { dawn: "日出", day: "中午", dusk: "黄昏", night: "夜晚" }, weather: { clear: ["晴天", "东风 2 级", "12 海里"], cloudy: ["多云", "海风 3 级", "9 海里"], fog: ["大雾", "微风 1 级", "2 海里"], rain: ["大雨", "东南风 4 级", "5 海里"], storm: ["雷雨", "强风 6 级", "3 海里"] }
  },
  en: {
    port: { driftwood: "Driftwood", coral: "Coral Port", mist: "Mistlight" }, route: { nearshore: "Coastal Run", coral: "Coral Route", abyss: "Mist Depths" }, routeHint: { nearshore: "Mostly common", coral: "Better rare odds", abyss: "Epic and legendary" }, fish: { silver_dart: "Silver Dart", coral_snapper: "Coral Snapper", moonfin_tuna: "Moonfin Tuna", ghost_ray: "Ghost Ray", sunscale_oarfish: "Sunscale Oarfish" }, rarity: { common: "Common", uncommon: "Uncommon", rare: "Rare", epic: "Epic", legendary: "Legendary" }, vessel: { skiff: "Fishing Skiff", trawler: "Trawler", ocean: "Ocean Vessel", deepsea: "Deep-Sea Ship" }, equipment: { engine: ["Engine", "-6% voyage time per level"], net: ["Net", "+1 catch damage every 2 levels"], sonar: ["Sonar", "+6% rare odds per level"], cooler: ["Cooler", "+2 slots per level"] }, crew: { captain: ["Captain", "Raises rare-fish odds"], fisher: ["Fisher", "+1 fish every 2 levels"], engineer: ["Engineer", "-4% voyage time per level"] }, facility: { berth: ["Berth", "+1 ship berth per level"], coldStorage: ["Cold Store", "+20 fish capacity per level"], market: ["Market", "+10% sale price per level"], lighthouse: ["Lighthouse", "Unlocks seas and large ships"] }, order: { "morning-market": "Morning Market", "reef-banquet": "Reef Banquet", "collector-cooler": "Deep-Sea Collection" }, period: { dawn: "Dawn", day: "Day", dusk: "Dusk", night: "Night" }, weather: { clear: ["Clear", "E wind 2", "12 nm"], cloudy: ["Cloudy", "Sea wind 3", "9 nm"], fog: ["Fog", "Light wind 1", "2 nm"], rain: ["Heavy rain", "SE wind 4", "5 nm"], storm: ["Storm", "Strong wind 6", "3 nm"] }
  },
  "pt-BR": {
    port: { driftwood: "Porto Madeira", coral: "Porto Coral", mist: "Porto Névoa" }, route: { nearshore: "Rota Costeira", coral: "Rota Coral", abyss: "Mar de Névoa" }, routeHint: { nearshore: "Peixes comuns", coral: "Mais raros", abyss: "Épicos e lendários" }, fish: { silver_dart: "Peixe-Flecha", coral_snapper: "Pargo-Coral", moonfin_tuna: "Atum-Lunar", ghost_ray: "Raia-Fantasma", sunscale_oarfish: "Peixe-Remo Solar" }, rarity: { common: "Comum", uncommon: "Incomum", rare: "Raro", epic: "Épico", legendary: "Lendário" }, vessel: { skiff: "Barco de Pesca", trawler: "Traineira", ocean: "Navio Oceânico", deepsea: "Navio Abissal" }, equipment: { engine: ["Motor", "-6% de tempo por nível"], net: ["Rede", "+1 dano a cada 2 níveis"], sonar: ["Sonar", "+6% de chance rara por nível"], cooler: ["Caixa Térmica", "+2 vagas por nível"] }, crew: { captain: ["Capitão", "Aumenta chance de peixe raro"], fisher: ["Pescador", "+1 peixe a cada 2 níveis"], engineer: ["Engenheiro", "-4% de tempo por nível"] }, facility: { berth: ["Cais", "+1 vaga de navio por nível"], coldStorage: ["Câmara Fria", "+20 de capacidade por nível"], market: ["Mercado", "+10% no preço por nível"], lighthouse: ["Farol", "Libera mares e navios grandes"] }, order: { "morning-market": "Feira da Manhã", "reef-banquet": "Banquete Coral", "collector-cooler": "Coleção Abissal" }, period: { dawn: "Amanhecer", day: "Dia", dusk: "Entardecer", night: "Noite" }, weather: { clear: ["Céu limpo", "Vento E 2", "12 mn"], cloudy: ["Nublado", "Brisa 3", "9 mn"], fog: ["Nevoeiro", "Brisa leve 1", "2 mn"], rain: ["Chuva forte", "Vento SE 4", "5 mn"], storm: ["Tempestade", "Vento forte 6", "3 mn"] }
  },
  de: {
    port: { driftwood: "Treibholzhafen", coral: "Korallenhafen", mist: "Nebelhafen" }, route: { nearshore: "Küstenfahrt", coral: "Korallenroute", abyss: "Nebeltiefe" }, routeHint: { nearshore: "Meist gewöhnlich", coral: "Mehr seltene", abyss: "Episch und legendär" }, fish: { silver_dart: "Silberpfeil", coral_snapper: "Korallenschnapper", moonfin_tuna: "Mondflossen-Thun", ghost_ray: "Geisterrochen", sunscale_oarfish: "Sonnen-Riemenfisch" }, rarity: { common: "Gewöhnlich", uncommon: "Ungewöhnlich", rare: "Selten", epic: "Episch", legendary: "Legendär" }, vessel: { skiff: "Fischerkahn", trawler: "Trawler", ocean: "Hochseeschiff", deepsea: "Tiefseeschiff" }, equipment: { engine: ["Motor", "-6% Fahrzeit je Stufe"], net: ["Netz", "+1 Fangschaden alle 2 Stufen"], sonar: ["Sonar", "+6% Selten-Chance je Stufe"], cooler: ["Kühlbox", "+2 Plätze je Stufe"] }, crew: { captain: ["Kapitän", "Erhöht die Selten-Chance"], fisher: ["Fischer", "+1 Fisch alle 2 Stufen"], engineer: ["Ingenieur", "-4% Fahrzeit je Stufe"] }, facility: { berth: ["Liegeplatz", "+1 Schiffsplatz je Stufe"], coldStorage: ["Kühllager", "+20 Kapazität je Stufe"], market: ["Markt", "+10% Preis je Stufe"], lighthouse: ["Leuchtturm", "Öffnet Meere und große Schiffe"] }, order: { "morning-market": "Morgenmarkt", "reef-banquet": "Riffbankett", "collector-cooler": "Tiefsee-Sammlung" }, period: { dawn: "Morgen", day: "Tag", dusk: "Abend", night: "Nacht" }, weather: { clear: ["Klar", "Ostwind 2", "12 sm"], cloudy: ["Wolkig", "Seewind 3", "9 sm"], fog: ["Nebel", "Leichtwind 1", "2 sm"], rain: ["Starkregen", "Südost 4", "5 sm"], storm: ["Gewitter", "Starkwind 6", "3 sm"] }
  },
  fr: {
    port: { driftwood: "Port Bois-flotté", coral: "Port Corail", mist: "Port Brume" }, route: { nearshore: "Sortie côtière", coral: "Route Corail", abyss: "Brumes profondes" }, routeHint: { nearshore: "Surtout communs", coral: "Plus de rares", abyss: "Épiques et légendaires" }, fish: { silver_dart: "Flèche d’argent", coral_snapper: "Vivaneau corail", moonfin_tuna: "Thon lunaire", ghost_ray: "Raie spectrale", sunscale_oarfish: "Régalec solaire" }, rarity: { common: "Commun", uncommon: "Inhabituel", rare: "Rare", epic: "Épique", legendary: "Légendaire" }, vessel: { skiff: "Barque de pêche", trawler: "Chalutier", ocean: "Navire hauturier", deepsea: "Navire abyssal" }, equipment: { engine: ["Moteur", "-6% de durée par niveau"], net: ["Filet", "+1 dégât tous les 2 niveaux"], sonar: ["Sonar", "+6% de rareté par niveau"], cooler: ["Glacière", "+2 places par niveau"] }, crew: { captain: ["Capitaine", "Augmente les poissons rares"], fisher: ["Pêcheur", "+1 poisson tous les 2 niveaux"], engineer: ["Ingénieur", "-4% de durée par niveau"] }, facility: { berth: ["Quai", "+1 navire par niveau"], coldStorage: ["Chambre froide", "+20 de capacité par niveau"], market: ["Marché", "+10% au prix par niveau"], lighthouse: ["Phare", "Ouvre mers et grands navires"] }, order: { "morning-market": "Marché du matin", "reef-banquet": "Banquet du récif", "collector-cooler": "Collection abyssale" }, period: { dawn: "Aube", day: "Jour", dusk: "Crépuscule", night: "Nuit" }, weather: { clear: ["Clair", "Vent E 2", "12 mn"], cloudy: ["Nuageux", "Brise 3", "9 mn"], fog: ["Brume", "Vent léger 1", "2 mn"], rain: ["Forte pluie", "Vent SE 4", "5 mn"], storm: ["Orage", "Vent fort 6", "3 mn"] }
  },
  ja: {
    port: { driftwood: "流木港", coral: "珊瑚港", mist: "霧灯港" }, route: { nearshore: "沿岸航路", coral: "珊瑚航路", abyss: "霧海深部" }, routeHint: { nearshore: "普通魚が中心", coral: "レア率上昇", abyss: "エピック・伝説" }, fish: { silver_dart: "ギンヤジウオ", coral_snapper: "サンゴフエダイ", moonfin_tuna: "ツキヒレマグロ", ghost_ray: "ユウコウエイ", sunscale_oarfish: "ヒリンウオ" }, rarity: { common: "普通", uncommon: "珍しい", rare: "レア", epic: "エピック", legendary: "伝説" }, vessel: { skiff: "小型漁船", trawler: "トロール船", ocean: "遠洋船", deepsea: "深海船" }, equipment: { engine: ["エンジン", "レベルごとに航海 -6%"], net: ["漁網", "2レベルごとにダメージ +1"], sonar: ["ソナー", "レベルごとにレア率 +6%"], cooler: ["保冷箱", "レベルごとに容量 +2"] }, crew: { captain: ["船長", "レア魚の出現率上昇"], fisher: ["漁師", "2レベルごとに魚 +1"], engineer: ["技師", "レベルごとに航海 -4%"] }, facility: { berth: ["停泊地", "レベルごとに船枠 +1"], coldStorage: ["冷蔵庫", "レベルごとに容量 +20"], market: ["市場", "レベルごとに価格 +10%"], lighthouse: ["灯台", "遠海と大型船を開放"] }, order: { "morning-market": "朝市の鮮魚", "reef-banquet": "珊瑚の宴", "collector-cooler": "深海コレクション" }, period: { dawn: "日の出", day: "昼", dusk: "夕暮れ", night: "夜" }, weather: { clear: ["晴れ", "東風 2", "12 海里"], cloudy: ["曇り", "海風 3", "9 海里"], fog: ["濃霧", "微風 1", "2 海里"], rain: ["大雨", "南東風 4", "5 海里"], storm: ["雷雨", "強風 6", "3 海里"] }
  },
  ko: {
    port: { driftwood: "유목항", coral: "산호항", mist: "안개등항" }, route: { nearshore: "연안 항로", coral: "산호 항로", abyss: "안개 심해" }, routeHint: { nearshore: "일반 물고기 중심", coral: "희귀 확률 상승", abyss: "에픽·전설 출현" }, fish: { silver_dart: "은빛창꼬치", coral_snapper: "산호퉁돔", moonfin_tuna: "달지느러미참치", ghost_ray: "유령가오리", sunscale_oarfish: "태양비늘산갈치" }, rarity: { common: "일반", uncommon: "고급", rare: "희귀", epic: "에픽", legendary: "전설" }, vessel: { skiff: "소형 어선", trawler: "트롤선", ocean: "원양선", deepsea: "심해선" }, equipment: { engine: ["엔진", "레벨마다 항해 시간 -6%"], net: ["어망", "2레벨마다 포획 피해 +1"], sonar: ["음파 탐지기", "레벨마다 희귀 확률 +6%"], cooler: ["보냉함", "레벨마다 용량 +2"] }, crew: { captain: ["선장", "희귀 물고기 확률 상승"], fisher: ["어부", "2레벨마다 물고기 +1"], engineer: ["기관사", "레벨마다 항해 시간 -4%"] }, facility: { berth: ["선석", "레벨마다 선박 자리 +1"], coldStorage: ["냉동고", "레벨마다 용량 +20"], market: ["시장", "레벨마다 판매가 +10%"], lighthouse: ["등대", "먼 바다와 대형선 개방"] }, order: { "morning-market": "아침 시장", "reef-banquet": "산호 연회", "collector-cooler": "심해 수집함" }, period: { dawn: "일출", day: "낮", dusk: "황혼", night: "밤" }, weather: { clear: ["맑음", "동풍 2", "12 해리"], cloudy: ["흐림", "해풍 3", "9 해리"], fog: ["짙은 안개", "미풍 1", "2 해리"], rain: ["폭우", "남동풍 4", "5 해리"], storm: ["뇌우", "강풍 6", "3 해리"] }
  }
};

const cannonEntities = {
  en: ["Cannon", "+1 pirate damage every 2 levels"],
  "pt-BR": ["Canhão", "+1 dano pirata a cada 2 níveis"],
  de: ["Kanone", "+1 Piratenschaden alle 2 Stufen"],
  fr: ["Canon", "+1 dégât pirate tous les 2 niveaux"],
  ja: ["大砲", "2レベルごとに海賊ダメージ +1"],
  ko: ["대포", "2레벨마다 해적 피해 +1"],
  "zh-Hans": ["大炮", "每 2 级增加 1 点海盗伤害"],
  "zh-Hant": ["大炮", "每 2 級增加 1 點海盜傷害"]
};

for (const [locale, value] of Object.entries(cannonEntities)) {
  ENTITY_TRANSLATIONS[locale].equipment.cannon = value;
}

const progressionFixEntities = {
  en: { hull: ["Hull", "+4 kg hold and +15 HP per level"], net: ["Net", "+1 catch damage per level"], cannon: ["Cannon", "+1 pirate damage per level"], fisher: ["Fisher", "+1 fish per level"], lighthouse: ["Lighthouse", "Unlocks seas; LV.4 boosts rarity and speed"] },
  "pt-BR": { hull: ["Casco", "+4 kg e +15 de vida por nível"], net: ["Rede", "+1 dano por nível"], cannon: ["Canhão", "+1 dano pirata por nível"], fisher: ["Pescador", "+1 peixe por nível"], lighthouse: ["Farol", "Libera mares; LV.4 melhora raridade e tempo"] },
  de: { hull: ["Rumpf", "+4 kg und +15 TP je Stufe"], net: ["Netz", "+1 Fangschaden je Stufe"], cannon: ["Kanone", "+1 Piratenschaden je Stufe"], fisher: ["Fischer", "+1 Fisch je Stufe"], lighthouse: ["Leuchtturm", "Öffnet Meere; LV.4 stärkt Seltenheit und Tempo"] },
  fr: { hull: ["Coque", "+4 kg et +15 PV par niveau"], net: ["Filet", "+1 dégât par niveau"], cannon: ["Canon", "+1 dégât pirate par niveau"], fisher: ["Pêcheur", "+1 poisson par niveau"], lighthouse: ["Phare", "Ouvre les mers ; LV.4 améliore rareté et vitesse"] },
  ja: { hull: ["船体", "レベルごとに積載 +4 kg・耐久 +15"], net: ["漁網", "レベルごとにダメージ +1"], cannon: ["大砲", "レベルごとに海賊ダメージ +1"], fisher: ["漁師", "レベルごとに魚 +1"], lighthouse: ["灯台", "海域開放・LV.4でレア率と速度上昇"] },
  ko: { hull: ["선체", "레벨마다 적재 +4 kg·체력 +15"], net: ["어망", "레벨마다 포획 피해 +1"], cannon: ["대포", "레벨마다 해적 피해 +1"], fisher: ["어부", "레벨마다 물고기 +1"], lighthouse: ["등대", "해역 개방·LV.4에서 희귀도와 속도 상승"] },
  "zh-Hans": { hull: ["船体", "每级载重 +4 kg、生命 +15"], net: ["渔网", "每级增加 1 点捕捞伤害"], cannon: ["大炮", "每级增加 1 点海盗伤害"], fisher: ["渔夫", "每级航程增加 1 条鱼"], lighthouse: ["灯塔", "解锁海域；LV.4 提升稀有率与航速"] },
  "zh-Hant": { hull: ["船體", "每級載重 +4 kg、生命 +15"], net: ["漁網", "每級增加 1 點捕魚傷害"], cannon: ["大炮", "每級增加 1 點海盜傷害"], fisher: ["漁夫", "每級航程增加 1 條魚"], lighthouse: ["燈塔", "解鎖海域；LV.4 提升稀有率與航速"] }
};

for (const [locale, values] of Object.entries(progressionFixEntities)) {
  ENTITY_TRANSLATIONS[locale].equipment.hull = values.hull;
  ENTITY_TRANSLATIONS[locale].equipment.net = values.net;
  ENTITY_TRANSLATIONS[locale].equipment.cannon = values.cannon;
  ENTITY_TRANSLATIONS[locale].crew.fisher = values.fisher;
  ENTITY_TRANSLATIONS[locale].facility.lighthouse = values.lighthouse;
}

const cannonScaleEntities = {
  en: ["Cannon", "Damage rises each level; larger vessels amplify it"],
  "pt-BR": ["Canhão", "Dano sobe por nível; navios maiores ampliam"],
  de: ["Kanone", "Mehr Schaden je Stufe; große Schiffe verstärken"],
  fr: ["Canon", "Dégâts par niveau ; grands navires amplifient"],
  ja: ["大砲", "レベルごとに威力上昇・大型船で増幅"],
  ko: ["대포", "레벨마다 피해 증가 · 대형선 보정"],
  "zh-Hans": ["大炮", "每级提高伤害，大型船会进一步增幅"],
  "zh-Hant": ["大炮", "每級提高傷害，大型船會進一步增幅"]
};

for (const [locale, value] of Object.entries(cannonScaleEntities)) {
  ENTITY_TRANSLATIONS[locale].equipment.cannon = value;
}

const progressionScaleEntities = {
  en: { engine: ["Engine", "Shortens every voyage level by level"], engineer: ["Engineer", "Shortens every voyage level by level"], lighthouse: ["Lighthouse", "Unlocks seas; LV.4+ boosts rarity and speed"] },
  "pt-BR": { engine: ["Motor", "Reduz viagens a cada nível"], engineer: ["Engenheiro", "Reduz viagens a cada nível"], lighthouse: ["Farol", "Libera mares; LV.4+ melhora raridade e tempo"] },
  de: { engine: ["Motor", "Verkürzt jede Fahrt pro Stufe"], engineer: ["Ingenieur", "Verkürzt jede Fahrt pro Stufe"], lighthouse: ["Leuchtturm", "Öffnet Meere; ab LV.4 mehr Seltenheit und Tempo"] },
  fr: { engine: ["Moteur", "Réduit chaque sortie par niveau"], engineer: ["Ingénieur", "Réduit chaque sortie par niveau"], lighthouse: ["Phare", "Ouvre les mers ; LV.4+ améliore rareté et vitesse"] },
  ja: { engine: ["エンジン", "レベルごとに航海時間を短縮"], engineer: ["技師", "レベルごとに航海時間を短縮"], lighthouse: ["灯台", "海域を解放・LV.4以降はレア率と速度上昇"] },
  ko: { engine: ["엔진", "레벨마다 항해 시간 단축"], engineer: ["기관사", "레벨마다 항해 시간 단축"], lighthouse: ["등대", "해역 개방·LV.4부터 희귀도와 속도 상승"] },
  "zh-Hans": { engine: ["引擎", "每级都会缩短航程时间"], engineer: ["工程师", "每级都会缩短航程时间"], lighthouse: ["灯塔", "解锁海域；LV.4 后提升稀有率与航速"] },
  "zh-Hant": { engine: ["引擎", "每級都會縮短航程時間"], engineer: ["工程師", "每級都會縮短航程時間"], lighthouse: ["燈塔", "解鎖海域；LV.4 後提升稀有率與航速"] }
};

for (const [locale, values] of Object.entries(progressionScaleEntities)) {
  ENTITY_TRANSLATIONS[locale].equipment.engine = values.engine;
  ENTITY_TRANSLATIONS[locale].crew.engineer = values.engineer;
  ENTITY_TRANSLATIONS[locale].facility.lighthouse = values.lighthouse;
}

const orderClientEntities = {
  en: { "dockside-cafe": "Dockside Cafe", "harbor-hotel": "Harbor Hotel", "ocean-research": "Ocean Research" },
  "pt-BR": { "dockside-cafe": "Café do Cais", "harbor-hotel": "Hotel do Porto", "ocean-research": "Pesquisa Oceânica" },
  de: { "dockside-cafe": "Kai-Café", "harbor-hotel": "Hafenhotel", "ocean-research": "Meeresforschung" },
  fr: { "dockside-cafe": "Café du quai", "harbor-hotel": "Hôtel du port", "ocean-research": "Recherche marine" },
  ja: { "dockside-cafe": "波止場カフェ", "harbor-hotel": "港ホテル", "ocean-research": "海洋研究所" },
  ko: { "dockside-cafe": "부두 카페", "harbor-hotel": "항구 호텔", "ocean-research": "해양 연구소" },
  "zh-Hans": { "dockside-cafe": "码头咖啡馆", "harbor-hotel": "港湾酒店", "ocean-research": "海洋研究所" },
  "zh-Hant": { "dockside-cafe": "碼頭咖啡館", "harbor-hotel": "港灣酒店", "ocean-research": "海洋研究所" }
};

for (const [locale, values] of Object.entries(orderClientEntities)) {
  Object.assign(ENTITY_TRANSLATIONS[locale].order, values);
}

const fishExpansionEntities = {
  en: { lagoon_blenny: "Lagoon Blenny", reef_butterfly: "Reef Butterflyfish", ember_lionfish: "Ember Lionfish", ribbon_moray: "Ribbon Moray", mist_sardine: "Mist Sardine", frostfin_hake: "Frostfin Hake", glass_squid: "Glass Squid", lantern_angler: "Lantern Anglerfish", crown_coelacanth: "Crown Coelacanth" },
  "pt-BR": { lagoon_blenny: "Blenídeo da Lagoa", reef_butterfly: "Peixe-Borboleta", ember_lionfish: "Peixe-Leão Brasa", ribbon_moray: "Moreia-Fita", mist_sardine: "Sardinha da Névoa", frostfin_hake: "Pescada Glacial", glass_squid: "Lula de Vidro", lantern_angler: "Tamboril-Lanterna", crown_coelacanth: "Celacanto-Coroa" },
  de: { lagoon_blenny: "Lagunen-Schleimfisch", reef_butterfly: "Riff-Falterfisch", ember_lionfish: "Glut-Feuerfisch", ribbon_moray: "Bandmuräne", mist_sardine: "Nebelsardine", frostfin_hake: "Frostflossen-Seehecht", glass_squid: "Glaskalmar", lantern_angler: "Laternen-Anglerfisch", crown_coelacanth: "Kronen-Quastenflosser" },
  fr: { lagoon_blenny: "Blennie du lagon", reef_butterfly: "Poisson-papillon", ember_lionfish: "Rascasse braise", ribbon_moray: "Murène ruban", mist_sardine: "Sardine des brumes", frostfin_hake: "Merlu givré", glass_squid: "Calmar de verre", lantern_angler: "Baudroie-lanterne", crown_coelacanth: "Cœlacanthe couronné" },
  ja: { lagoon_blenny: "ラグーンギンポ", reef_butterfly: "リーフチョウチョウウオ", ember_lionfish: "ヒノコミノカサゴ", ribbon_moray: "リボンウツボ", mist_sardine: "キリウミイワシ", frostfin_hake: "シモヒレヘイク", glass_squid: "ガラスイカ", lantern_angler: "ランタンアンコウ", crown_coelacanth: "オウカンシーラカンス" },
  ko: { lagoon_blenny: "석호베도라치", reef_butterfly: "산호나비고기", ember_lionfish: "불씨쏠배감펭", ribbon_moray: "리본곰치", mist_sardine: "안개정어리", frostfin_hake: "서리지느러미대구", glass_squid: "유리오징어", lantern_angler: "등불아귀", crown_coelacanth: "왕관실러캔스" },
  "zh-Hans": { lagoon_blenny: "潟湖鳚", reef_butterfly: "珊瑚蝶鱼", ember_lionfish: "赤焰狮子鱼", ribbon_moray: "缎带海鳝", mist_sardine: "雾海沙丁鱼", frostfin_hake: "霜鳍鳕", glass_squid: "玻璃鱿鱼", lantern_angler: "灯笼鮟鱇", crown_coelacanth: "皇冠腔棘鱼" },
  "zh-Hant": { lagoon_blenny: "潟湖鳚", reef_butterfly: "珊瑚蝶魚", ember_lionfish: "赤焰獅子魚", ribbon_moray: "緞帶海鱔", mist_sardine: "霧海沙甸魚", frostfin_hake: "霜鰭鱈", glass_squid: "玻璃魷魚", lantern_angler: "燈籠鮟鱇", crown_coelacanth: "皇冠腔棘魚" }
};

for (const [locale, values] of Object.entries(fishExpansionEntities)) {
  Object.assign(ENTITY_TRANSLATIONS[locale].fish, values);
}

function fill(template, variables = {}) {
  return String(template).replace(/\{(\w+)\}/g, (_, key) => variables[key] ?? `{${key}}`);
}

export function translate(locale, key, variables) {
  const selected = MESSAGES[locale] || MESSAGES.en;
  return fill(selected[key] ?? MESSAGES.en[key] ?? key, variables);
}

export function entity(locale, group, id, fallback = id, index = null) {
  const selected = ENTITY_TRANSLATIONS[locale] || ENTITY_TRANSLATIONS.en;
  const value = selected[group]?.[id] ?? ENTITY_TRANSLATIONS.en[group]?.[id];
  if (Array.isArray(value)) return value[index ?? 0] ?? fallback;
  return value ?? fallback;
}

export function numberLocale(locale) {
  return ({ en: "en-US", "pt-BR": "pt-BR", de: "de-DE", fr: "fr-FR", ja: "ja-JP", ko: "ko-KR", "zh-Hans": "zh-CN", "zh-Hant": "zh-HK" })[locale] || "en-US";
}

export function localeCoverage() {
  const baseKeys = Object.keys(en);
  return Object.fromEntries(Object.entries(MESSAGES).map(([locale, dictionary]) => [locale, baseKeys.filter((key) => !dictionary[key])]));
}
