import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Anchor } from "@phosphor-icons/react/dist/csr/Anchor";
import { ArrowLeft } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { ArrowRight } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { ArrowClockwise } from "@phosphor-icons/react/dist/csr/ArrowClockwise";
import { Archive } from "@phosphor-icons/react/dist/csr/Archive";
import { Boat } from "@phosphor-icons/react/dist/csr/Boat";
import { Binoculars } from "@phosphor-icons/react/dist/csr/Binoculars";
import { Buildings } from "@phosphor-icons/react/dist/csr/Buildings";
import { CaretRight } from "@phosphor-icons/react/dist/csr/CaretRight";
import { CheckCircle } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { ChartLineUp } from "@phosphor-icons/react/dist/csr/ChartLineUp";
import { ClipboardText } from "@phosphor-icons/react/dist/csr/ClipboardText";
import { ClockCountdown } from "@phosphor-icons/react/dist/csr/ClockCountdown";
import { CloudFog } from "@phosphor-icons/react/dist/csr/CloudFog";
import { CloudLightning } from "@phosphor-icons/react/dist/csr/CloudLightning";
import { CloudRain } from "@phosphor-icons/react/dist/csr/CloudRain";
import { CloudSun } from "@phosphor-icons/react/dist/csr/CloudSun";
import { Coins } from "@phosphor-icons/react/dist/csr/Coins";
import { Compass } from "@phosphor-icons/react/dist/csr/Compass";
import { Crosshair } from "@phosphor-icons/react/dist/csr/Crosshair";
import { Cube } from "@phosphor-icons/react/dist/csr/Cube";
import { FishSimple } from "@phosphor-icons/react/dist/csr/FishSimple";
import { Gauge } from "@phosphor-icons/react/dist/csr/Gauge";
import { Gear } from "@phosphor-icons/react/dist/csr/Gear";
import { Engine } from "@phosphor-icons/react/dist/csr/Engine";
import { HouseLine } from "@phosphor-icons/react/dist/csr/HouseLine";
import { Lighthouse } from "@phosphor-icons/react/dist/csr/Lighthouse";
import { MapTrifold } from "@phosphor-icons/react/dist/csr/MapTrifold";
import { Minus } from "@phosphor-icons/react/dist/csr/Minus";
import { Package } from "@phosphor-icons/react/dist/csr/Package";
import { Pause } from "@phosphor-icons/react/dist/csr/Pause";
import { Play } from "@phosphor-icons/react/dist/csr/Play";
import { Plus } from "@phosphor-icons/react/dist/csr/Plus";
import { Robot } from "@phosphor-icons/react/dist/csr/Robot";
import { Snowflake } from "@phosphor-icons/react/dist/csr/Snowflake";
import { Sparkle } from "@phosphor-icons/react/dist/csr/Sparkle";
import { SteeringWheel } from "@phosphor-icons/react/dist/csr/SteeringWheel";
import { Storefront } from "@phosphor-icons/react/dist/csr/Storefront";
import { Sun } from "@phosphor-icons/react/dist/csr/Sun";
import { Waves } from "@phosphor-icons/react/dist/csr/Waves";
import { Warehouse } from "@phosphor-icons/react/dist/csr/Warehouse";
import { UsersThree } from "@phosphor-icons/react/dist/csr/UsersThree";
import { Wrench } from "@phosphor-icons/react/dist/csr/Wrench";
import { X } from "@phosphor-icons/react/dist/csr/X";
import { useI18n } from "./I18nContext.jsx";
import { useHarborState } from "./hooks/useHarborState.js";
import { useWorldEnvironment } from "./hooks/useWorldEnvironment.js";

const weatherIcons = { clear: Sun, cloudy: CloudSun, fog: CloudFog, rain: CloudRain, storm: CloudLightning };
const ONBOARDING_STORAGE_KEY = "token-harbor-onboarding-v1";

function fishCatalogMap(state) {
  return Object.fromEntries((state.fishCatalog || []).map((fish) => [fish.id, fish]));
}

function FishArtwork({ fish, draggable = false }) {
  if (fish?.sprite) {
    return <span className="fish-artwork sprite" aria-hidden="true" style={{ "--sprite-x": `${fish.sprite.col * 25}%`, "--sprite-y": `${fish.sprite.row * 100}%` }} />;
  }
  return <img className="fish-artwork" src={`/assets/fish/${fish?.asset}`} alt="" draggable={draggable} />;
}

function localizeError(message, t) {
  const value = String(message || "");
  if (/最高等級|max level/i.test(value)) return t("error.max");
  if (/金幣|coins/i.test(value)) return t("error.coins");
  if (/冷庫|保鮮箱|船艙|capacity|full|overweight/i.test(value)) return t("error.storage");
  if (/貨倉|貨物|cargo|warehouse/i.test(value)) return t("error.cargo");
  if (/燈塔|泊位|港口|port|lighthouse|berth|vessel|ship/i.test(value)) return t("error.locked");
  if (/航程|voyage/i.test(value)) return t("error.busy");
  if (/航力|power/i.test(value)) return t("error.power");
  return t("error.action");
}

function TopBar({ state }) {
  const { formatNumber, t } = useI18n();
  const resources = [
    { icon: Gauge, label: t("resource.power"), value: formatNumber(state?.sailingPower), tone: "power" },
    { icon: Coins, label: t("resource.coins"), value: formatNumber(state?.coins), tone: "coins" },
    { icon: Compass, label: t("resource.distance"), value: `${formatNumber(state?.totalDistance)} ${t("unit.nm")}`, tone: "distance" }
  ];
  return (
    <header className="topbar">
      <div className="brand-lockup" aria-label="Token Harbor">
        <span className="brand-mark"><Anchor size={22} weight="duotone" /></span>
        <span className="brand-type"><strong>Token Harbor</strong><small>CODEX COMPANION</small></span>
      </div>
      <div className="resource-row" data-onboarding="power">
        {resources.map(({ icon: Icon, label, value, tone }) => (
          <div className={`resource ${tone}`} key={label}>
            <Icon size={18} weight="duotone" aria-hidden="true" />
            <span><small>{label}</small><strong className="resource-value" key={value}>{value}</strong></span>
          </div>
        ))}
      </div>
      <div className="level-mark" title={t("top.level")}><span>{t("top.harbor")}</span><strong>LV.{state?.harborLevel || 1}</strong></div>
    </header>
  );
}

const navigation = [
  { id: "harbor", icon: MapTrifold, label: "nav.harbor" },
  { id: "voyages", icon: SteeringWheel, label: "nav.voyages" },
  { id: "warehouse", icon: Package, label: "nav.warehouse" },
  { id: "orders", icon: ClipboardText, label: "nav.orders" },
  { id: "progression", icon: ChartLineUp, label: "nav.progression" },
  { id: "settings", icon: Gear, label: "nav.settings" }
];

function Navigation({ active, onChange }) {
  const { t } = useI18n();
  return (
    <nav className="nav-rail" aria-label={t("nav.menu")}>
      {navigation.map(({ id, icon: Icon, label }) => (
        <button className={active === id ? "active" : ""} key={id} onClick={() => onChange(id)} title={t(label)} aria-label={t(label)}>
          <Icon size={22} weight={active === id ? "fill" : "regular"} aria-hidden="true" /><span>{t(label)}</span>
        </button>
      ))}
    </nav>
  );
}

function PortMarker({ id, unlocked, progress = 1, selected, onClick }) {
  const { name, t } = useI18n();
  const label = name("port", id, id);
  return (
    <button className={`port-marker marker-${id} ${selected ? "selected" : ""} ${unlocked ? "unlocked" : "locked"}`} onClick={() => onClick(id)} aria-label={`${label}${unlocked ? t("port.open") : t("port.building")}`}>
      <span className="port-ring"><Anchor size={30} weight="duotone" /></span>
      {!unlocked && <span className="marker-progress"><i style={{ width: `${Math.max(5, progress * 100)}%` }} /></span>}
      <strong>{label}</strong>
      <small>{unlocked ? t("port.berthOpen") : `${Math.round(progress * 100)}%`}</small>
    </button>
  );
}

function WorldBackdrop({ scene, environment }) {
  const images = {
    night: `/assets/${scene}-night-clear.png`,
    dawn: `/assets/${scene}-dawn.png`,
    day: `/assets/${scene}-day.png`,
    dusk: `/assets/${scene}-dusk.png`
  };
  const transition = environment.sceneTransition || { from: environment.period.id, to: environment.period.id, progress: 0 };
  const style = {
    "--scene-blend": transition.progress.toFixed(3),
    "--warmth": environment.warmth.toFixed(3)
  };
  return (
    <div
      className={`world-backdrop world-${scene} weather-${environment.weather.id} time-${environment.period.id}`}
      style={style}
      data-scene-from={transition.from}
      data-scene-to={transition.to}
      data-scene-progress={transition.progress.toFixed(3)}
      aria-hidden="true"
    >
      <img className={`world-image ${scene}-visual world-image-base`} src={images[transition.from]} alt="" />
      <img className={`world-image ${scene}-visual world-image-blend`} src={images[transition.to]} alt="" />
      <div className="time-wash" />
      <div className="weather-effects">
        <span className="cloud-shade" />
        <span className="fog-bank fog-bank-far" />
        <span className="fog-bank fog-bank-near" />
        <span className="rain-field rain-field-far" />
        <span className="rain-field rain-field-near" />
        <span className="lightning-flash" />
      </div>
      <div className="world-vignette" />
    </div>
  );
}

function EnvironmentReadout({ environment, compact = false }) {
  const { name, t } = useI18n();
  const WeatherIcon = weatherIcons[environment.weather.id] || Waves;
  const period = name("period", environment.period.id, environment.period.label);
  const weather = name("weather", environment.weather.id, environment.weather.label, 0);
  const wind = name("weather", environment.weather.id, environment.weather.wind, 1);
  const visibility = name("weather", environment.weather.id, environment.weather.visibility, 2);
  return (
    <div className={compact ? "environment-readout compact" : "environment-readout"} aria-label={`${period}, ${weather}`}>
      <WeatherIcon size={16} weight="duotone" />
      <span>{period} · {weather}</span>
      {!compact && <><i /><span>{wind}</span><i /><span>{t("environment.visibility", { value: visibility })}</span><time>{environment.clock}</time></>}
    </div>
  );
}

function HarborScene({ state, selectedPort, onSelectPort, environment }) {
  const { name, t } = useI18n();
  const coral = state.ports.coral;
  const mist = state.ports.mist;
  const period = name("period", environment.period.id, environment.period.label);
  const weather = name("weather", environment.weather.id, environment.weather.label, 0);
  return (
    <div className="harbor-scene" aria-label={t("world.map", { period, weather })} data-period={environment.period.id} data-weather={environment.weather.id} data-daylight={environment.daylight.toFixed(3)}>
      <WorldBackdrop scene="harbor" environment={environment} />
      <PortMarker id="driftwood" unlocked selected={selectedPort === "driftwood"} onClick={onSelectPort} />
      <PortMarker id="coral" unlocked={coral.unlocked} progress={coral.progress / coral.cost} selected={selectedPort === "coral"} onClick={onSelectPort} />
      <PortMarker id="mist" unlocked={mist.unlocked} progress={mist.progress / mist.cost} selected={selectedPort === "mist"} onClick={onSelectPort} />
      <EnvironmentReadout environment={environment} />
    </div>
  );
}

function PanelHeading({ icon: Icon, eyebrow, title }) {
  return (
    <div className="panel-heading">
      <span className="heading-icon"><Icon size={22} weight="duotone" /></span>
      <div><small>{eyebrow}</small><h2>{title}</h2></div>
    </div>
  );
}

function PortPanel({ state, selectedPort, setSelectedPort, act, busy }) {
  const { formatNumber, name, t } = useI18n();
  const port = state.ports[selectedPort];
  const [amount, setAmount] = useState(10);
  const [allocationBurst, setAllocationBurst] = useState(0);
  const allocationSequence = useRef(0);
  const remaining = Math.max(0, port.cost - port.progress);
  const applied = Math.min(amount, remaining, state.sailingPower);
  const allocatePower = async () => {
    const next = await act({ type: "allocate_port", portId: selectedPort, amount });
    if (!next) return;
    allocationSequence.current += 1;
    setAllocationBurst(allocationSequence.current);
    window.setTimeout(() => setAllocationBurst(0), 900);
  };
  return (
    <div className="panel-content">
      <PanelHeading icon={Anchor} eyebrow={t("port.eyebrow")} title={name("port", selectedPort, port.name)} />
      {port.unlocked ? (
        <div className="open-port">
          <span className="status-stamp"><CheckCircle size={15} weight="fill" /> {t("port.openStatus")}</span>
          <p>{t("port.openCopy")}</p>
          <button className="primary-button" onClick={() => setSelectedPort("coral")} disabled={!state.ports.coral || state.ports.coral.unlocked}>{t("port.next")} <CaretRight size={17} weight="bold" /></button>
        </div>
      ) : (
        <>
          <div className="progress-block">
            <div><span>{t("port.progress")}</span><strong>{formatNumber(port.progress)} / {port.cost}</strong></div>
            <div className="progress-track"><i style={{ width: `${(port.progress / port.cost) * 100}%` }} /></div>
          </div>
          <label className="field-label" htmlFor="power-amount">{t("port.allocate")}</label>
          <div className="stepper">
            <button onClick={() => setAmount(Math.max(1, amount - 5))} aria-label={t("port.decrease")}><Minus size={18} weight="bold" /></button>
            <input id="power-amount" type="number" min="1" max={Math.ceil(remaining)} value={amount} onChange={(event) => setAmount(Math.max(1, Number(event.target.value) || 1))} />
            <button onClick={() => setAmount(Math.min(Math.ceil(remaining), amount + 5))} aria-label={t("port.increase")}><Plus size={18} weight="bold" /></button>
          </div>
          <button className={`primary-button ${allocationBurst ? "activated" : ""}`} disabled={busy || applied <= 0} onClick={allocatePower}>
            <Sparkle size={18} weight="fill" /> {t("port.invest", { value: formatNumber(applied) })}
          </button>
          {allocationBurst > 0 && (
            <div className="allocation-feedback" key={allocationBurst} aria-live="polite">
              <Sparkle size={14} weight="fill" /><span>{t("port.advanced")}</span><Sparkle size={11} weight="fill" />
            </div>
          )}
          <p className="microcopy">{t("port.keep")}</p>
        </>
      )}
    </div>
  );
}

function VoyagesPanel({ state, act, busy }) {
  const { name, t } = useI18n();
  const [mode, setMode] = useState("manual");
  const [routeSelection, setRouteSelection] = useState({});
  const catalog = fishCatalogMap(state);
  const spareVessels = state.progression.vessels.filter((vessel) => !vessel.active);
  const activeVessel = state.progression.vessels.find((vessel) => vessel.active);
  const activeVesselDamaged = activeVessel && activeVessel.hp < activeVessel.maxHp;
  const manualChoices = state.progression.vessels.filter((vessel) => vessel.assignment !== "automatic");
  const routeAvailableFor = (route, vessel) => (
    (!route.requiredPort || state.ports[route.requiredPort]?.unlocked) &&
    state.progression.effects.lighthouseLevel >= route.requiredLighthouse &&
    vessel.rank >= route.requiredVesselRank
  );
  return (
    <div className="panel-content">
      <PanelHeading icon={mode === "manual" ? SteeringWheel : UsersThree} eyebrow={t("voyage.eyebrow")} title={mode === "manual" ? t("voyage.manualTitle") : t("auto.title")} />
      <div className="voyage-mode-tabs" role="tablist" aria-label={t("voyage.modeLabel")}>
        <button className={mode === "manual" ? "active" : ""} role="tab" aria-selected={mode === "manual"} onClick={() => setMode("manual")}><SteeringWheel size={17} weight="duotone" />{t("voyage.manual")}</button>
        <button className={mode === "auto" ? "active" : ""} role="tab" aria-selected={mode === "auto"} onClick={() => setMode("auto")}><UsersThree size={17} weight="duotone" />{t("voyage.auto")}</button>
      </div>

      {mode === "manual" && (
        <div role="tabpanel">
          <div className="manual-voyage-note"><ClockCountdown size={16} weight="duotone" /><span><strong>{t("voyage.ninetySeconds")}</strong><small>{t("voyage.returnAnytime")}</small></span></div>
          <label className="manual-vessel-picker">
            <span><SteeringWheel size={16} weight="duotone" /><small>{t("fleet.manualShip")}</small></span>
            <select value={state.boat.vesselId} disabled={busy || Boolean(state.activeVoyage)} onChange={(event) => act({ type: "assign_manual_vessel", vesselId: event.target.value })}>
              {manualChoices.map((vessel) => <option key={vessel.id} value={vessel.id}>{t("fleet.number", { number: String(vessel.number).padStart(2, "0") })} · {name("vessel", vessel.classId, vessel.name)}</option>)}
            </select>
          </label>
          <div className="capacity-strip">
            <span><Snowflake size={15} weight="duotone" /> {t("voyage.cooler", { value: state.boatCapacity.slots })}</span>
            <span><Cube size={15} weight="duotone" /> {t("voyage.cargo", { value: state.boatCapacity.weight })}</span>
          </div>
          <div className="route-list">
            {state.routes.map((route) => {
              const portReady = !route.requiredPort || state.ports[route.requiredPort]?.unlocked;
              const lighthouseReady = state.progression.effects.lighthouseLevel >= route.requiredLighthouse;
              const vesselReady = state.progression.effects.vesselRank >= route.requiredVesselRank;
              const available = portReady && lighthouseReady && vesselReady;
              const duration = Math.ceil((route.durationMs * state.progression.effects.voyageDurationMultiplier) / 1000);
              const lockedReason = !portReady ? t("voyage.portLocked") : !lighthouseReady ? t("voyage.lighthouseLock", { level: route.requiredLighthouse }) : !vesselReady ? t("voyage.vesselLock", { level: route.requiredVesselRank }) : null;
              return (
                <button className="route-row manual-route" key={route.id} disabled={busy || !available || !!state.activeVoyage || activeVesselDamaged || state.sailingPower < route.cost} onClick={() => act({ type: "launch_voyage", routeId: route.id })}>
                  <span className="route-icon"><Boat size={24} weight="duotone" /></span>
                  <span><strong>{name("route", route.id, route.name)}</strong><small>{t("voyage.routeMeta", { seconds: duration, distance: route.distance })}</small><small className="rarity-hint">{name("routeHint", route.id, route.rarityLabel)}</small></span>
                  <em>{activeVesselDamaged ? t("repair.required") : available ? t("voyage.depart", { value: route.cost }) : lockedReason}</em>
                </button>
              );
            })}
          </div>
          {state.activeVoyage && <div className="current-voyage"><span className="live-dot" /><strong>{name("route", state.activeVoyage.routeId, state.activeVoyage.routeName)}</strong><small>{t("voyage.sailing")}</small></div>}
        </div>
      )}

      {mode === "auto" && (
        <div className="auto-fleet-panel" role="tabpanel">
          <div className="auto-rule-banner"><Robot size={19} weight="duotone" /><span><strong>{t("auto.ruleTitle")}</strong><small>{t("auto.ruleCopy")}</small></span><em>{t("auto.efficiency")}</em></div>
          <div className="auto-resource-strip"><span><Wrench size={14} weight="duotone" />{t("auto.materials", { value: state.materials || 0 })}</span><small>{t("auto.codexContinues")}</small></div>
          {!spareVessels.length && <div className="auto-empty"><Boat size={28} weight="duotone" /><strong>{t("auto.noSpare")}</strong><span>{t("auto.noSpareCopy")}</span></div>}
          <div className="auto-vessel-list">
            {spareVessels.map((vessel) => {
              const mission = state.autoVoyages?.[vessel.id];
              const availableRoutes = state.routes.filter((route) => routeAvailableFor(route, vessel));
              const selectedRouteId = availableRoutes.some((route) => route.id === routeSelection[vessel.id]) ? routeSelection[vessel.id] : availableRoutes[0]?.id;
              const selectedRoute = availableRoutes.find((route) => route.id === selectedRouteId);
              const progress = Math.max(0, Math.min(1, mission?.progress || 0));
              const secondsLeft = mission ? Math.max(0, Math.ceil((mission.durationMs * (1 - progress)) / 1000)) : 0;
              const vesselDamaged = vessel.hp < vessel.maxHp;
              const rewardGroups = Object.values((mission?.rewards?.fish || []).reduce((groups, fish) => {
                groups[fish.speciesId] ||= { ...fish, count: 0 };
                groups[fish.speciesId].count += 1;
                return groups;
              }, {}));
              return (
                <article className={`auto-vessel-card ${mission?.ready ? "ready" : mission ? "running" : "idle"}`} key={vessel.id}>
                  <header><span className="auto-vessel-icon"><Boat size={22} weight="duotone" /></span><span><strong>{t("fleet.number", { number: String(vessel.number).padStart(2, "0") })} · {name("vessel", vessel.classId, vessel.name)}</strong><small>{mission ? name("route", mission.routeId, mission.routeName) : vesselDamaged ? t("repair.required") : t("auto.idle")}</small></span><em>{mission?.ready ? t("auto.returned") : mission ? t("auto.atSea") : vesselDamaged ? `${vessel.hp}/${vessel.maxHp}` : t("auto.available")}</em></header>
                  {mission ? (
                    <>
                      <div className="auto-progress"><span><i style={{ width: `${progress * 100}%` }} /></span><b>{mission.ready ? t("auto.ready") : t("auto.timeLeft", { seconds: secondsLeft })}</b></div>
                      {mission.ready && <div className="auto-rewards"><span>{rewardGroups.map((fish) => `${name("fish", fish.speciesId, catalog[fish.speciesId]?.name || fish.name)} x${fish.count}`).join(" · ")}</span><small><Coins size={12} weight="fill" />{mission.rewards.coins} <Wrench size={12} weight="fill" />{mission.rewards.materials}</small></div>}
                      <button className="auto-claim-button" disabled={busy || !mission.ready} onClick={() => act({ type: "claim_auto_voyage", vesselId: vessel.id })}>{mission.ready ? t("auto.collect") : t("auto.sailing")}</button>
                    </>
                  ) : (
                    <div className="auto-dispatch-controls">
                      <select aria-label={t("auto.routeFor", { vessel: name("vessel", vessel.classId, vessel.name) })} value={selectedRouteId || ""} onChange={(event) => setRouteSelection((current) => ({ ...current, [vessel.id]: event.target.value }))} disabled={!availableRoutes.length}>
                        {availableRoutes.map((route) => <option key={route.id} value={route.id}>{name("route", route.id, route.name)} · {t("voyage.cost", { value: route.cost })}</option>)}
                      </select>
                      <button disabled={busy || vesselDamaged || !selectedRoute || state.sailingPower < (selectedRoute?.cost || Infinity)} onClick={() => act({ type: "dispatch_auto_voyage", vesselId: vessel.id, routeId: selectedRouteId })}>{vesselDamaged ? t("repair.short") : availableRoutes.length ? t("auto.dispatch") : t("auto.noRoute")}</button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function WarehousePanel({ state, act, busy }) {
  const { name, t } = useI18n();
  const stored = state.progression.effects.inventoryCount;
  const capacity = state.progression.effects.warehouseCapacity;
  const marketMultiplier = state.progression.effects.marketMultiplier;
  return (
    <div className="panel-content">
      <PanelHeading icon={Archive} eyebrow={t("warehouse.eyebrow")} title={t("warehouse.title")} />
      <div className="capacity-strip">
        <span><Warehouse size={15} weight="duotone" /> {t("warehouse.cold", { stored, capacity })}</span>
        <span><Storefront size={15} weight="duotone" /> {t("warehouse.price", { value: marketMultiplier })}</span>
      </div>
      <div className="fish-inventory-list">
        {(state.fishCatalog || []).map((fish) => {
          const quantity = state.inventory[fish.id] || 0;
          const price = Math.round(fish.value * marketMultiplier);
          return (
            <div className={`fish-inventory-row rarity-${fish.rarity} ${quantity ? "owned" : "empty"}`} key={fish.id}>
              <FishArtwork fish={fish} />
              <span><strong>{name("fish", fish.id, fish.name)}</strong><small style={{ color: state.rarities[fish.rarity].color }}>{name("rarity", fish.rarity, state.rarities[fish.rarity].label)} · {fish.weight} kg</small></span>
              <span className="inventory-actions"><b>{quantity}</b><button disabled={busy || !quantity} onClick={() => act({ type: "sell_fish", speciesId: fish.id, amount: 1 })}><Coins size={11} weight="fill" /> {price}</button></span>
            </div>
          );
        })}
      </div>
      <div className="panel-note"><Package size={18} weight="duotone" /><span>{t("warehouse.note")}</span></div>
    </div>
  );
}

function OrdersPanel({ state, act, busy }) {
  const { formatNumber, name, t } = useI18n();
  const catalog = fishCatalogMap(state);
  const [clock, setClock] = useState(() => Date.now());
  const [feedback, setFeedback] = useState(null);
  const feedbackSequence = useRef(0);
  const marketMultiplier = state.progression.effects.marketMultiplier;
  const refreshSeconds = Math.max(0, Math.ceil(((state.orderBoard?.freeRefreshAt || 0) - clock) / 1000));
  const refreshActive = refreshSeconds > 0;
  const refreshTime = `${Math.floor(refreshSeconds / 60)}:${String(refreshSeconds % 60).padStart(2, "0")}`;
  useEffect(() => {
    if (!refreshActive) return undefined;
    const timer = window.setInterval(() => setClock(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, [refreshActive]);
  const deliver = async (order) => {
    const reward = Math.round(order.reward * marketMultiplier);
    const next = await act({ type: "deliver_order", orderId: order.id });
    if (!next) return;
    feedbackSequence.current += 1;
    setFeedback({ reward, key: feedbackSequence.current });
    window.setTimeout(() => setFeedback(null), 2_200);
  };
  const refreshOrders = async () => {
    const next = await act({ type: "refresh_orders" });
    if (next) setClock(Date.now());
  };
  return (
    <div className="panel-content">
      <PanelHeading icon={ClipboardText} eyebrow={t("orders.eyebrow")} title={t("orders.title")} />
      <div className="order-board-summary">
        <span><small>{t("orders.completed")}</small><strong>{formatNumber(state.orderBoard?.completedCount || 0)}</strong></span>
        <span><small>{t("orders.market")}</small><strong>×{marketMultiplier}</strong></span>
        <button disabled={busy || refreshSeconds > 0} onClick={refreshOrders} title={refreshSeconds ? t("orders.refreshIn", { time: refreshTime }) : t("orders.refresh")}>
          <ArrowClockwise size={16} weight="bold" /><span>{refreshSeconds ? refreshTime : t("orders.refresh")}</span>
        </button>
      </div>
      {feedback && <div className="order-delivery-feedback" key={feedback.key} aria-live="polite"><Sparkle size={15} weight="fill" /><span>{t("orders.deliveredReward", { value: formatNumber(feedback.reward) })}</span></div>}
      <div className="order-list">
        {state.orders.map((order) => {
          const ready = Object.entries(order.needs).every(([item, amount]) => state.inventory[item] >= amount);
          const totalNeeded = Object.values(order.needs).reduce((sum, amount) => sum + amount, 0);
          const totalOwned = Object.entries(order.needs).reduce((sum, [item, amount]) => sum + Math.min(amount, state.inventory[item] || 0), 0);
          const progress = totalNeeded ? Math.round((totalOwned / totalNeeded) * 100) : 0;
          return (
            <article className={`order-card tier-${order.tier} ${ready ? "ready" : ""}`} key={order.id}>
              <header className="order-title"><span><small>{t(`orders.tier.${order.tier}`)}</small><strong>{name("order", order.templateId || order.id, order.title)}</strong></span><em><Coins size={13} weight="fill" />{formatNumber(Math.round(order.reward * marketMultiplier))}</em></header>
              <div className="order-progress"><span><i style={{ width: `${progress}%` }} /></span><b>{progress}%</b></div>
              <div className="order-cargo-list">
                {Object.entries(order.needs).map(([item, amount]) => {
                  const fish = catalog[item];
                  const owned = state.inventory[item] || 0;
                  return <div className={owned >= amount ? "fulfilled" : ""} key={item}><FishArtwork fish={fish} /><span><strong>{name("fish", item, fish.name)}</strong><small>{t("orders.stock", { owned, needed: amount })}</small></span><b>{owned >= amount ? <CheckCircle size={16} weight="fill" /> : `${owned}/${amount}`}</b></div>;
                })}
              </div>
              <button className="order-deliver-button" disabled={busy || !ready} onClick={() => deliver(order)}><Package size={16} weight="fill" /><span>{ready ? t("orders.deliver") : t("orders.short")}</span></button>
            </article>
          );
        })}
      </div>
    </div>
  );
}

const progressionSections = [
  { id: "fleet", label: "progress.fleet", icon: Boat },
  { id: "equipment", label: "progress.equipment", icon: Wrench },
  { id: "crew", label: "progress.crew", icon: UsersThree },
  { id: "harbor", label: "progress.harbor", icon: Buildings }
];

const equipmentIcons = { engine: Engine, hull: Boat, net: Waves, sonar: Binoculars, cooler: Snowflake, cannon: Crosshair };
const crewIcons = { captain: SteeringWheel, fisher: FishSimple, engineer: Wrench };
const facilityIcons = { berth: Anchor, coldStorage: Warehouse, market: Storefront, lighthouse: Lighthouse };

function ProgressionRow({ icon: Icon, title, detail, meta, action, active = false, disabled, onAction, tone = "" }) {
  const { t } = useI18n();
  return (
    <div className={`progression-row ${tone || ""}`}>
      <span className="progression-icon"><Icon size={22} weight="duotone" /></span>
      <span className="progression-copy"><strong>{title}</strong><small>{detail}</small>{meta && <em>{meta}</em>}</span>
      <span className="progression-action">
        {active ? <b>{t("progress.active")}</b> : <button disabled={disabled} onClick={onAction}>{typeof action === "number" && <Coins size={12} weight="fill" />}{action}</button>}
      </span>
    </div>
  );
}

function FleetSelector({ vessels, selectedVesselId, busy, onSelect }) {
  const { name, t } = useI18n();
  return (
    <div className="fleet-selector" role="tablist" aria-label={t("fleet.manage") }>
      {vessels.map((vessel) => (
        <button className={vessel.id === selectedVesselId ? "active" : ""} key={vessel.id} role="tab" aria-selected={vessel.id === selectedVesselId} disabled={busy} onClick={() => onSelect(vessel.id)}>
          <span>{t("fleet.number", { number: String(vessel.number).padStart(2, "0") })}</span>
          <strong>{name("vessel", vessel.classId, vessel.name)}</strong>
          <small>{t(`fleet.${vessel.assignment}`)}</small>
        </button>
      ))}
    </div>
  );
}

function ProgressionPanel({ state, act, busy }) {
  const { formatNumber, name, t } = useI18n();
  const [section, setSection] = useState("fleet");
  const progression = state.progression;
  const effects = progression.effects;
  const selectedVessel = progression.vessels.find((vessel) => vessel.id === progression.selectedVesselId) || progression.vessels[0];
  const selectedEffects = progression.selectedEffects || effects;
  const selectedAtSea = selectedVessel?.assignment === "automatic" || state.activeVoyage?.vesselId === selectedVessel?.id;
  const selectVessel = (vesselId) => act({ type: "select_vessel", vesselId });
  return (
    <div className="panel-content">
      <PanelHeading icon={ChartLineUp} eyebrow={t("progress.eyebrow")} title={t("progress.title")} />
      <div className="progression-tabs" role="tablist" aria-label={t("progress.tabs")}>
        {progressionSections.map(({ id, label, icon: Icon }) => (
          <button className={section === id ? "active" : ""} key={id} role="tab" aria-selected={section === id} onClick={() => setSection(id)}>
            <Icon size={17} weight={section === id ? "fill" : "duotone"} /><span>{t(label)}</span>
          </button>
        ))}
      </div>

      {section === "fleet" && (
        <div className="progression-list" role="tabpanel">
          <div className="progression-summary"><span>{t("fleet.manualShip")}<strong>{t("fleet.number", { number: String(effects.vessel.number).padStart(2, "0") })} · {name("vessel", effects.vessel.classId, effects.vessel.name)}</strong></span><span>{t("progress.berths")}<strong>{progression.vessels.length} / {effects.berthCapacity}</strong></span></div>
          <FleetSelector vessels={progression.vessels} selectedVesselId={progression.selectedVesselId} busy={busy} onSelect={selectVessel} />
          {selectedVessel && (
            <section className={`fleet-detail ${selectedVessel.hp < selectedVessel.maxHp ? "damaged" : ""}`}>
              <header>
                <span className="fleet-detail-icon"><Boat size={28} weight="duotone" /></span>
                <span><small>{t("fleet.selectedShip")}</small><strong>{name("vessel", selectedVessel.classId, selectedVessel.name)}</strong><em>{t("ship.healthValue", { hp: selectedVessel.hp, max: selectedVessel.maxHp })}</em></span>
                <b>{t(`fleet.${selectedVessel.assignment}`)}</b>
              </header>
              <div className="fleet-evolution" aria-label={t("fleet.evolution")}>
                <span>{name("vessel", selectedVessel.classId, selectedVessel.name)}</span><CaretRight size={14} />
                <strong>{selectedVessel.nextClass ? name("vessel", selectedVessel.nextClass.id, selectedVessel.nextClass.name) : t("fleet.finalClass")}</strong>
              </div>
              <div className="fleet-stats"><span>{selectedVessel.weight} kg</span><span>{selectedVessel.slots} {t("unit.slots")}</span><span>{selectedVessel.encounterBonus ? t("progress.school", { value: selectedVessel.encounterBonus }) : t("progress.coastal")}</span></div>
              <div className="fleet-actions">
                {selectedVessel.hp < selectedVessel.maxHp && <button disabled={busy || selectedAtSea || state.coins < selectedVessel.repairCost} onClick={() => act({ type: "repair_vessel", vesselId: selectedVessel.id })}><Wrench size={15} /><span>{t("repair.short")}</span>{selectedVessel.repairMaterials > 0 && <em><Cube size={12} weight="fill" />{formatNumber(selectedVessel.repairMaterials)}</em>}<em><Coins size={12} weight="fill" />{formatNumber(selectedVessel.repairCost)}</em></button>}
                {!selectedVessel.active && <button disabled={busy || selectedVessel.assignment === "automatic" || Boolean(state.activeVoyage)} onClick={() => act({ type: "assign_manual_vessel", vesselId: selectedVessel.id })}><SteeringWheel size={15} />{t("fleet.setManual")}</button>}
                {selectedVessel.nextClass && <button className="primary" disabled={busy || Boolean(selectedVessel.upgradeLockedReason) || selectedVessel.hp < selectedVessel.maxHp || state.coins < selectedVessel.upgradeCost} onClick={() => act({ type: "upgrade_vessel", vesselId: selectedVessel.id })}><ChartLineUp size={15} /><span>{t("fleet.upgradeTo", { name: name("vessel", selectedVessel.nextClass.id, selectedVessel.nextClass.name) })}</span><em><Coins size={12} weight="fill" />{formatNumber(selectedVessel.upgradeCost)}</em></button>}
              </div>
              {selectedVessel.upgradeLockedReason && <p className="fleet-lock">{selectedAtSea ? t("fleet.returnToUpgrade") : t("progress.lighthouseNeed", { level: selectedVessel.nextClass?.requiredLighthouse })}</p>}
            </section>
          )}
          <button className="build-vessel-button" disabled={busy || !progression.canBuildVessel || state.coins < progression.newVesselCost} onClick={() => act({ type: "buy_vessel" })}>
            <Plus size={19} weight="bold" /><span><strong>{t("fleet.build")}</strong><small>{progression.canBuildVessel ? t("fleet.newCopy") : t("progress.berthShort")}</small></span><em><Coins size={13} weight="fill" />{formatNumber(progression.newVesselCost)}</em>
          </button>
        </div>
      )}

      {section === "equipment" && (
        <div className="progression-list" role="tabpanel">
          <FleetSelector vessels={progression.vessels} selectedVesselId={progression.selectedVesselId} busy={busy} onSelect={selectVessel} />
          <div className="equipment-vessel-context"><Boat size={17} weight="duotone" /><span>{t("fleet.upgrading")}<strong>{t("fleet.number", { number: String(selectedVessel.number).padStart(2, "0") })} · {name("vessel", selectedVessel.classId, selectedVessel.name)}</strong></span></div>
          <div className="progression-summary three"><span>{t("progress.net")}<strong>{selectedEffects.netDamage} {t("unit.damage")}</strong></span><span>{t("progress.cannon")}<strong>{selectedEffects.cannonDamage} {t("unit.damage")}</strong></span><span>{t("progress.voyage")}<strong>{Math.round(selectedEffects.voyageDurationMultiplier * 100)}%</strong></span></div>
          {progression.equipment.map((item) => {
            const meta = selectedAtSea ? t("progress.inPort") : item.worldCapped ? t("progress.portCap", { level: item.availableMaxLevel }) : null;
            const action = item.worldCapped ? t("progress.nextPort") : item.nextCost ?? t("progress.max");
            return <ProgressionRow key={item.id} icon={equipmentIcons[item.id]} title={`${name("equipment", item.id, item.name, 0)} LV.${item.level}`} detail={name("equipment", item.id, item.detail, 1)} meta={meta} action={action} disabled={busy || selectedAtSea || item.nextCost === null || state.coins < item.nextCost} onAction={() => act({ type: "upgrade_equipment", itemId: item.id, vesselId: selectedVessel.id })} />;
          })}
        </div>
      )}

      {section === "crew" && (
        <div className="progression-list" role="tabpanel">
          <div className="progression-summary"><span>{t("progress.fleet")}<strong>+{effects.encounterBonus}</strong></span><span>{t("progress.rarity")}<strong>+{Math.round(effects.rarityBonus * 100)}%</strong></span></div>
          {progression.crew.map((role) => {
            const meta = role.worldCapped ? t("progress.portCap", { level: role.availableMaxLevel }) : state.activeVoyage ? t("progress.nextVoyage") : name("rarity", role.rarity.id, role.rarity.label);
            const action = role.worldCapped ? t("progress.nextPort") : role.nextCost ?? t("progress.max");
            return <ProgressionRow key={role.id} icon={crewIcons[role.id]} title={`${name("crew", role.id, role.name, 0)} LV.${role.level}`} detail={name("crew", role.id, role.detail, 1)} meta={meta} action={action} disabled={busy || role.nextCost === null || state.coins < role.nextCost} onAction={() => act({ type: "upgrade_crew", roleId: role.id })} />;
          })}
        </div>
      )}

      {section === "harbor" && (
        <div className="progression-list" role="tabpanel">
          <div className="progression-summary"><span>{t("progress.cold")}<strong>{effects.inventoryCount} / {effects.warehouseCapacity}</strong></span><span>{t("progress.market")}<strong>×{effects.marketMultiplier}</strong></span></div>
          {progression.facilities.map((facility) => {
            const values = { berth: t("facility.berthValue", { value: effects.berthCapacity }), coldStorage: t("facility.coldValue", { value: effects.warehouseCapacity }), market: t("facility.marketValue", { value: effects.marketMultiplier }), lighthouse: effects.lighthouseLevel >= 4 ? t("facility.lightBonus", { rarity: Math.round(effects.beaconRarityBonus * 100), voyage: Math.round(effects.beaconVoyageBonus * 100) }) : t("facility.lightValue", { value: effects.lighthouseLevel }) };
            const action = facility.worldCapped ? t("progress.nextPort") : facility.nextCost ?? t("progress.max");
            return <ProgressionRow key={facility.id} icon={facilityIcons[facility.id]} title={`${name("facility", facility.id, facility.name, 0)} LV.${facility.level}`} detail={name("facility", facility.id, facility.detail, 1)} meta={values[facility.id]} action={action} disabled={busy || facility.nextCost === null || state.coins < facility.nextCost} onAction={() => act({ type: "upgrade_facility", facilityId: facility.id })} />;
          })}
        </div>
      )}
    </div>
  );
}

function LanguageGrid({ compact = false }) {
  const { language, languages, setLanguage, t } = useI18n();
  return (
    <div className={`language-grid ${compact ? "compact" : ""}`} role="radiogroup" aria-label={t("settings.list")}>
      {languages.map((item) => (
        <button className={language === item.id ? "active" : ""} key={item.id} role="radio" aria-checked={language === item.id} onClick={() => setLanguage(item.id)}>
          <span><strong>{item.label}</strong><small>{item.short}</small></span>
          {language === item.id && <CheckCircle size={17} weight="fill" aria-hidden="true" />}
        </button>
      ))}
    </div>
  );
}

function SettingsPanel({ onReplayOnboarding }) {
  const { language, languages, t } = useI18n();
  const selected = languages.find((item) => item.id === language);
  return (
    <div className="panel-content settings-panel">
      <PanelHeading icon={Gear} eyebrow={t("settings.eyebrow")} title={t("settings.title")} />
      <LanguageGrid />
      <div className="settings-current"><span>{t("settings.selected")}</span><strong>{selected?.label}</strong></div>
      <button className="replay-guide-button" onClick={onReplayOnboarding}><Compass size={17} weight="duotone" />{t("onboarding.replay")}</button>
    </div>
  );
}

function Inspector({ view, state, selectedPort, setSelectedPort, act, busy, onReplayOnboarding }) {
  return (
    <aside className="inspector" data-onboarding={view === "harbor" ? "harbor" : view === "voyages" ? "routes" : undefined}>
      <div className="inspector-grip" aria-hidden="true" />
      {view === "harbor" && <PortPanel {...{ state, selectedPort, setSelectedPort, act, busy }} />}
      {view === "voyages" && <VoyagesPanel {...{ state, act, busy }} />}
      {view === "warehouse" && <WarehousePanel {...{ state, act, busy }} />}
      {view === "orders" && <OrdersPanel {...{ state, act, busy }} />}
      {view === "progression" && <ProgressionPanel {...{ state, act, busy }} />}
      {view === "settings" && <SettingsPanel onReplayOnboarding={onReplayOnboarding} />}
    </aside>
  );
}

function FishActor({ encounter, fish, rarity, paused, pendingHits, netDamage, evading, onHit }) {
  const { name, t } = useI18n();
  const visibleHp = Math.max(0, encounter.hp - pendingHits * netDamage);
  const fishName = name("fish", fish.id, fish.name);
  const rarityName = name("rarity", fish.rarity, rarity.label);
  const style = {
    "--fish-lane": `${encounter.lane}%`,
    "--swim-duration": `${encounter.swimSeconds}s`,
    "--swim-delay": `${encounter.delaySeconds}s`,
    "--rarity-color": rarity.color
  };
  return (
    <button
      className={`fish-actor swim-${encounter.direction} dash-${encounter.dashProfile || "a"} behavior-${encounter.behaviorProfile || "pass"} rarity-${fish.rarity} ${evading ? "hit-evade" : ""}`}
      data-encounter-id={encounter.id}
      data-dash-profile={encounter.dashProfile || "a"}
      data-behavior-profile={encounter.behaviorProfile || "pass"}
      style={style}
      onClick={() => onHit(encounter, fish)}
      disabled={paused || visibleHp <= 0}
      aria-label={t("fish.aria", { name: fishName, rarity: rarityName, hp: visibleHp, max: encounter.maxHp })}
    >
      <span className="fish-nameplate"><strong>{fishName}</strong><em>{rarityName}</em></span>
      <span className="fish-body"><FishArtwork fish={fish} /></span>
      <span className="fish-health"><i style={{ width: `${(visibleHp / encounter.maxHp) * 100}%` }} /><small>{visibleHp} / {encounter.maxHp}</small></span>
    </button>
  );
}

function VoyageOverlay({ voyage, act, route, environment, fishCatalog, rarities, boatCapacity, voyageCargo }) {
  const { name, t } = useI18n();
  const catalog = useMemo(() => Object.fromEntries(fishCatalog.map((fish) => [fish.id, fish])), [fishCatalog]);
  const pendingHitsRef = useRef({});
  const [pendingHits, setPendingHits] = useState({});
  const [catchFeedback, setCatchFeedback] = useState(null);
  const [evadingFish, setEvadingFish] = useState({});
  const evadeTimers = useRef({});
  const [docking, setDocking] = useState(false);
  const [pendingPirateHits, setPendingPirateHits] = useState(0);
  const pendingPirateHitsRef = useRef(0);
  const [pirateHit, setPirateHit] = useState(false);
  const [shipHit, setShipHit] = useState(false);
  const [combatClock, setCombatClock] = useState(() => Date.now());
  const previousShipHp = useRef(voyage.shipHp);
  const feedbackSequence = useRef(0);
  const paused = !!voyage.pausedAt;
  const caughtCount = voyage.caughtFish.length;
  const readyToDock = Boolean(voyage.ready);
  const wrecked = !!voyage.wrecked;
  const pirate = voyage.threat?.pirate;
  const pirateAppeared = Boolean(pirate && pirate.status !== "waiting");
  const pirateVisible = pirateAppeared && pirate.status !== "defeated" && !wrecked && !readyToDock;
  const cannonDamage = Math.max(1, Number(voyage.cannonDamage || 1));
  const pirateHp = pirate ? Math.max(0, pirate.hp - pendingPirateHits * cannonDamage) : 0;
  const pirateAttackSeconds = pirate?.lastAttackAt ? Math.max(0, Math.ceil((pirate.attackIntervalMs - (combatClock - pirate.lastAttackAt)) / 1000)) : Math.ceil((pirate?.attackIntervalMs || 0) / 1000);
  const piratePatrolSeconds = Number(pirate?.patrolSeconds) || { nearshore: 12, coral: 9.7, abyss: 7.4 }[voyage.routeId] || 10;
  const shipHealthPercent = Math.max(0, Math.min(100, (voyage.shipHp / Math.max(1, voyage.maxShipHp)) * 100));
  const shipHealthState = shipHealthPercent <= 30 ? "critical" : shipHealthPercent <= 60 ? "warning" : "safe";
  const cargoFull = voyageCargo.slots >= boatCapacity.slots || voyageCargo.weight >= boatCapacity.weight;
  const netDamage = Math.max(1, Number(voyage.netDamage || 1));
  const caughtGroups = Object.values((voyage.caughtFish || []).reduce((groups, fish) => {
    groups[fish.speciesId] ||= { ...fish, count: 0 };
    groups[fish.speciesId].count += 1;
    return groups;
  }, {}));
  useEffect(() => () => Object.values(evadeTimers.current).forEach((timer) => window.clearTimeout(timer)), []);
  useEffect(() => {
    if (voyage.shipHp < previousShipHp.current) {
      setShipHit(true);
      const timer = window.setTimeout(() => setShipHit(false), 620);
      previousShipHp.current = voyage.shipHp;
      return () => window.clearTimeout(timer);
    }
    previousShipHp.current = voyage.shipHp;
    return undefined;
  }, [voyage.shipHp]);
  useEffect(() => {
    if (!pirateVisible || paused || wrecked) return undefined;
    const clockTimer = window.setInterval(() => setCombatClock(Date.now()), 250);
    return () => window.clearInterval(clockTimer);
  }, [pirateVisible, paused, wrecked]);
  const triggerEvade = (encounterId) => {
    window.clearTimeout(evadeTimers.current[encounterId]);
    setEvadingFish((current) => ({ ...current, [encounterId]: true }));
    evadeTimers.current[encounterId] = window.setTimeout(() => {
      setEvadingFish((current) => {
        const next = { ...current };
        delete next[encounterId];
        return next;
      });
      delete evadeTimers.current[encounterId];
    }, 420);
  };
  const hitFish = async (encounter, fish) => {
    const queued = pendingHitsRef.current[encounter.id] || 0;
    if (encounter.hp - queued * netDamage <= 0) return;
    triggerEvade(encounter.id);
    pendingHitsRef.current[encounter.id] = queued + 1;
    setPendingHits({ ...pendingHitsRef.current });
    const next = await act({ type: "hit_fish", encounterId: encounter.id });
    pendingHitsRef.current[encounter.id] = Math.max(0, (pendingHitsRef.current[encounter.id] || 1) - 1);
    setPendingHits({ ...pendingHitsRef.current });
    if (!next) return;
    const updated = next.activeVoyage?.encounters.find((item) => item.id === encounter.id);
    feedbackSequence.current += 1;
    setCatchFeedback({ lane: encounter.lane, name: name("fish", fish.id, fish.name), caught: updated?.status === "caught", damage: netDamage, key: feedbackSequence.current });
    window.setTimeout(() => setCatchFeedback(null), 850);
  };
  const hitPirate = async () => {
    if (!pirateVisible || pirateHp <= 0 || paused) return;
    pendingPirateHitsRef.current += 1;
    setPendingPirateHits(pendingPirateHitsRef.current);
    setPirateHit(true);
    window.setTimeout(() => setPirateHit(false), 150);
    await act({ type: "hit_pirate" });
    pendingPirateHitsRef.current = Math.max(0, pendingPirateHitsRef.current - 1);
    setPendingPirateHits(pendingPirateHitsRef.current);
  };
  const dockVoyage = async () => {
    setDocking(true);
    await new Promise((resolve) => window.setTimeout(resolve, 650));
    await act({ type: "complete_voyage" });
  };
  const returnVoyage = async () => {
    setDocking(true);
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    const next = await act({ type: "return_voyage" });
    if (!next) setDocking(false);
  };
  return (
    <div className={`voyage-overlay ${docking ? "docking" : ""} ${paused ? "paused" : ""} ${wrecked ? `wrecked ${voyage.wreckReason || ""}` : ""} ${shipHit ? "ship-hit" : ""}`} aria-label={t("world.voyage", { period: name("period", environment.period.id, environment.period.label), weather: name("weather", environment.weather.id, environment.weather.label, 0) })} data-period={environment.period.id} data-weather={environment.weather.id}>
      <WorldBackdrop scene="voyage" environment={environment} />
      {!readyToDock && !wrecked && (voyage.encounters || []).filter((encounter) => encounter.status === "active").map((encounter) => {
        const fish = catalog[encounter.speciesId];
        return fish ? <FishActor key={encounter.id} encounter={encounter} fish={fish} rarity={rarities[fish.rarity]} paused={paused} pendingHits={pendingHits[encounter.id] || 0} netDamage={netDamage} evading={Boolean(evadingFish[encounter.id])} onHit={hitFish} /> : null;
      })}
      {pirateVisible && (
        <button className={`pirate-actor pirate-route-${voyage.routeId} pirate-threat-${pirate.tier || 1} ${pirateHit ? "hit" : ""}`} style={{ "--pirate-patrol-duration": `${piratePatrolSeconds}s` }} data-motion-route={voyage.routeId} data-threat-tier={pirate.tier || 1} onClick={hitPirate} disabled={paused || pirateHp <= 0} aria-label={t("pirate.aria", { hp: pirateHp, max: pirate.maxHp })}>
          <span className="pirate-warning"><Crosshair size={14} weight="fill" /><strong>{t("pirate.name")}</strong><em>{t("pirate.attackIn", { seconds: pirateAttackSeconds })}</em></span>
          <span className="pirate-vessel" aria-hidden="true">
            <img className="pirate-view pirate-view-left" src="/assets/pirate-raider-left.png" alt="" draggable="false" />
            <img className="pirate-view pirate-view-front" src="/assets/pirate-raider-front.png" alt="" draggable="false" />
            <img className="pirate-view pirate-view-right" src="/assets/pirate-raider-right.png" alt="" draggable="false" />
          </span>
          <span className="pirate-health"><i style={{ width: `${(pirateHp / pirate.maxHp) * 100}%` }} /><small>{pirateHp} / {pirate.maxHp}</small></span>
          {pirate.stolenFish > 0 && <span className="pirate-loot"><FishSimple size={12} weight="fill" />-{pirate.stolenFish}</span>}
        </button>
      )}
      {catchFeedback && (
        <div className={`catch-feedback ${catchFeedback.caught ? "captured" : ""}`} key={catchFeedback.key} style={{ left: "50%", top: `${catchFeedback.lane}%` }} aria-live="polite">
          <Sparkle size={13} weight="fill" /><strong>{catchFeedback.caught ? t("fish.caught", { name: catchFeedback.name }) : t("fish.hit", { damage: catchFeedback.damage })}</strong>
          <FishSimple className="burst-fish burst-a" size={14} weight="fill" />
          <FishSimple className="burst-fish burst-b" size={11} weight="fill" />
        </div>
      )}
      <div className="voyage-hud">
        <div><small>{wrecked ? t("wreck.title") : readyToDock ? t("voyage.done") : t("voyage.sailing")}</small><strong>{name("route", voyage.routeId, voyage.routeName)}</strong><span className="voyage-meta"><span className="catch-count"><FishSimple size={12} weight="fill" /> {t("voyage.catch", { caught: caughtCount, total: voyage.encounters.length })}</span><EnvironmentReadout environment={environment} compact /></span></div>
        <div className="voyage-progress-block">
          <div className="voyage-instruments">
            <div className="voyage-progress"><span><i style={{ width: `${voyage.progress * 100}%` }} /></span><em>{Math.round(voyage.progress * 100)}%</em></div>
            <div className={`ship-health-panel ${shipHealthState} ${shipHit ? "hit" : ""}`} role="meter" aria-label={t("ship.healthValue", { hp: voyage.shipHp, max: voyage.maxShipHp })} aria-valuemin={0} aria-valuemax={voyage.maxShipHp} aria-valuenow={voyage.shipHp}>
              <span className="ship-health-icon"><Boat size={16} weight="fill" /></span>
              <strong>{t("ship.healthValue", { hp: voyage.shipHp, max: voyage.maxShipHp })}</strong>
              <span className="ship-health-bar"><i style={{ width: `${shipHealthPercent}%` }} /></span>
            </div>
          </div>
          <div className="cargo-meter"><span><Snowflake size={12} weight="fill" /> {voyageCargo.slots}/{boatCapacity.slots}</span><span><Cube size={12} weight="fill" /> {voyageCargo.weight}/{boatCapacity.weight} kg</span></div>
        </div>
        <div className="voyage-actions">
          <button onClick={() => act({ type: "toggle_voyage_pause" })} aria-label={paused ? t("voyage.resume") : t("voyage.pause")} title={paused ? t("voyage.resume") : t("voyage.pause")} disabled={readyToDock || wrecked}>{readyToDock ? <ClockCountdown size={20} weight="fill" /> : paused ? <Play size={20} weight="fill" /> : <Pause size={20} weight="fill" />}</button>
          <button className="return-voyage-button" onClick={returnVoyage} aria-label={t("voyage.returnNow")} title={t("voyage.returnNow")} disabled={readyToDock || docking}><HouseLine size={18} weight="fill" /><span>{wrecked ? t("wreck.towShort") : t("voyage.return")}</span></button>
        </div>
      </div>
      {caughtCount === 0 && !paused && !readyToDock && !wrecked && !pirateVisible && <div className="voyage-instruction"><FishSimple size={16} weight="fill" /><span>{t("voyage.instruction")}</span></div>}
      {pirateVisible && !paused && <div className="pirate-instruction"><Crosshair size={17} weight="fill" /><span>{t("pirate.instruction", { damage: cannonDamage })}</span></div>}
      {pirate?.status === "defeated" && !readyToDock && !wrecked && <div className="pirate-defeated"><CheckCircle size={16} weight="fill" /><span>{t("pirate.defeated")}</span></div>}
      {cargoFull && !readyToDock && <div className="cargo-full-banner"><Snowflake size={16} weight="fill" /><span>{t("voyage.full")}</span></div>}
      {paused && !readyToDock && <div className="pause-banner"><Robot size={24} weight="duotone" /><span><strong>{voyage.pauseReason === "agent" ? t("voyage.codexWait") : t("voyage.paused")}</strong><small>{voyage.pauseReason === "agent" ? t("voyage.codexCopy") : t("voyage.resumeCopy")}</small></span></div>}
      {wrecked && (
        <div className="wreck-dialog" role="dialog" aria-label={t("wreck.title")}>
          <span className="wreck-icon">{voyage.wreckReason === "hurricane" ? <CloudLightning size={36} weight="duotone" /> : <Boat size={36} weight="duotone" />}</span>
          <small>{voyage.wreckReason === "hurricane" ? t("wreck.hurricaneAlert") : t("wreck.pirateAlert")}</small>
          <h2>{t("wreck.title")}</h2>
          <p>{voyage.wreckReason === "hurricane" ? t("wreck.hurricane") : t("wreck.pirates")}</p>
          <strong>{t("wreck.lost")}</strong>
          <button className="tow-button" onClick={returnVoyage} disabled={docking}><Wrench size={19} weight="fill" /><span>{docking ? t("voyage.docking") : t("wreck.tow")}</span><ArrowRight size={18} weight="bold" /></button>
        </div>
      )}
      {readyToDock && !wrecked && (
        <div className="voyage-complete" role="dialog" aria-label={t("voyage.summary")}>
          <span className="completion-icon"><Boat size={30} weight="duotone" /></span>
          <small>{t("voyage.done")}</small>
          <h2>{caughtCount ? t("voyage.fullReturn") : t("voyage.emptyReturn")}</h2>
          <div className={`catch-manifest ${caughtGroups.length ? "" : "empty"}`}>
            {caughtGroups.length ? caughtGroups.map((fish) => <div key={fish.speciesId}><FishArtwork fish={catalog[fish.speciesId]} /><span><strong>{name("fish", fish.speciesId, fish.name)}</strong><small style={{ color: rarities[fish.rarity].color }}>{name("rarity", fish.rarity, rarities[fish.rarity].label)}</small></span><b>×{fish.count}</b></div>) : <span>{t("voyage.noCatch")}</span>}
          </div>
          <div className="voyage-recap"><span><Compass size={15} weight="duotone" /> +{route?.distance || 0} {t("unit.nm")}</span><span><Snowflake size={15} weight="fill" /> {voyageCargo.slots}/{boatCapacity.slots} {t("unit.fish")}</span><span><Cube size={15} weight="fill" /> {voyageCargo.weight} kg</span></div>
          <button className="dock-button" onClick={dockVoyage} disabled={docking}>
            <HouseLine size={19} weight="fill" /><span>{docking ? t("voyage.docking") : t("voyage.unload")}</span><ArrowRight size={18} weight="bold" />
          </button>
        </div>
      )}
    </div>
  );
}

function CodexStatus({ agents }) {
  const { t } = useI18n();
  let status = { tone: "quiet", title: t("status.idle"), detail: t("status.idleCopy") };
  if (agents?.running) status = { tone: "working", title: t("status.running", { count: agents.running }), detail: t("status.sail") };
  if (agents?.needsInput) status = { tone: "attention", title: t("status.approval"), detail: t("status.paused") };
  else if (agents?.ready) status = { tone: "ready", title: t("status.finished"), detail: t("status.paused") };
  return <footer className={`codex-status ${status.tone}`} data-onboarding="codex"><span className="status-pulse" /><Robot size={18} weight="duotone" /><strong>{status.title}</strong><span>{status.detail}</span></footer>;
}

function Onboarding({ onComplete, onViewChange }) {
  const { t } = useI18n();
  const dialogRef = useRef(null);
  const [step, setStep] = useState(0);
  const [measuredTargetRect, setMeasuredTargetRect] = useState(null);
  const steps = [
    { icon: Anchor, title: t("onboarding.welcomeTitle"), body: t("onboarding.welcomeBody"), position: "center" },
    { icon: Gauge, title: t("onboarding.powerTitle"), body: t("onboarding.powerBody"), target: "power", position: "right" },
    { icon: Buildings, title: t("onboarding.harborTitle"), body: t("onboarding.harborBody"), target: "harbor", view: "harbor", position: "left" },
    { icon: SteeringWheel, title: t("onboarding.routeTitle"), body: t("onboarding.routeBody"), target: "routes", view: "voyages", position: "left" },
    { icon: FishSimple, title: t("onboarding.catchTitle"), body: t("onboarding.catchBody"), target: "sea", position: "right" },
    { icon: Robot, title: t("onboarding.codexTitle"), body: t("onboarding.codexBody"), target: "codex", position: "top" }
  ];
  const current = steps[step];
  const StepIcon = current.icon;

  useLayoutEffect(() => {
    if (!current.target) return undefined;
    let frame = 0;
    const measure = () => {
      const target = document.querySelector(`[data-onboarding="${current.target}"]`);
      if (!target) return;
      const rect = target.getBoundingClientRect();
      setMeasuredTargetRect({ left: rect.left, top: rect.top, width: rect.width, height: rect.height });
    };
    frame = window.requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
    };
  }, [current.target]);
  const targetRect = current.target ? measuredTargetRect : null;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => dialogRef.current?.focus());
    const onKeyDown = (event) => {
      if (event.key === "Escape") onComplete();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onComplete, step]);

  const moveTo = (nextStep) => {
    const next = steps[nextStep];
    if (next?.view) onViewChange(next.view);
    setStep(nextStep);
  };

  const highlightStyle = targetRect ? (() => {
    const left = Math.max(0, targetRect.left - 6);
    const top = Math.max(0, targetRect.top - 6);
    return {
      left: `${left}px`,
      top: `${top}px`,
      width: `${Math.max(20, Math.min(window.innerWidth - left, targetRect.width + 12))}px`,
      height: `${Math.max(20, Math.min(window.innerHeight - top, targetRect.height + 12))}px`
    };
  })() : undefined;

  return (
    <div className={`onboarding-layer ${targetRect ? "has-target" : "welcome"}`}>
      {targetRect ? <div className="onboarding-highlight" style={highlightStyle} aria-hidden="true" /> : <div className="onboarding-scrim" aria-hidden="true" />}
      <section className={`onboarding-card position-${current.position}`} role="dialog" aria-modal="true" aria-labelledby="onboarding-title" ref={dialogRef} tabIndex={-1}>
        <header className="onboarding-header">
          <span><StepIcon size={20} weight="duotone" />{t("onboarding.label")}</span>
          <button onClick={onComplete}>{t("onboarding.skip")}</button>
        </header>
        <div className="onboarding-progress" aria-hidden="true">{steps.map((_, index) => <i className={index <= step ? "active" : ""} key={index} />)}</div>
        <div className="onboarding-copy">
          <small>{String(step + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}</small>
          <h2 id="onboarding-title">{current.title}</h2>
          <p>{current.body}</p>
        </div>
        {step === 0 && <LanguageGrid compact />}
        <footer className="onboarding-actions">
          <button className="onboarding-back" onClick={() => moveTo(step - 1)} disabled={step === 0} aria-label={t("onboarding.back")} title={t("onboarding.back")}><ArrowLeft size={18} weight="bold" /></button>
          <button className="onboarding-next" onClick={() => step === steps.length - 1 ? onComplete() : moveTo(step + 1)}>{step === steps.length - 1 ? t("onboarding.finish") : t("onboarding.next")}<ArrowRight size={18} weight="bold" /></button>
        </footer>
      </section>
    </div>
  );
}

function initialOnboardingOpen() {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(ONBOARDING_STORAGE_KEY) !== "complete";
}

export default function App() {
  const { t } = useI18n();
  const { state, error, busy, act, dismissError } = useHarborState();
  const environment = useWorldEnvironment();
  const [view, setView] = useState("harbor");
  const [selectedPort, setSelectedPort] = useState("coral");
  const [onboardingOpen, setOnboardingOpen] = useState(initialOnboardingOpen);
  const completeOnboarding = useCallback(() => {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, "complete");
    setOnboardingOpen(false);
  }, []);
  const localizedError = error ? localizeError(error, t) : null;
  if (!state) return <div className="loading-screen"><Anchor size={36} weight="duotone" /><strong>{t("loading.title")}</strong><span>{localizedError || t("loading.copy")}</span></div>;
  return (
    <div className={`app-shell ambient-${environment.period.id}`} data-world-weather={environment.weather.id}>
      <TopBar state={state} />
      <Navigation active={view} onChange={setView} />
      <main className="game-stage" data-onboarding="sea">
        <HarborScene state={state} selectedPort={selectedPort} environment={environment} onSelectPort={(id) => { setSelectedPort(id); setView("harbor"); }} />
        {state.activeVoyage && <VoyageOverlay voyage={state.activeVoyage} route={state.routes.find((route) => route.id === state.activeVoyage.routeId)} environment={environment} fishCatalog={state.fishCatalog} rarities={state.rarities} boatCapacity={state.activeVoyage.boatCapacity || state.boatCapacity} voyageCargo={state.voyageCargo} act={act} />}
      </main>
      <Inspector key={`${view}-${selectedPort}`} {...{ view, state, selectedPort, setSelectedPort, act, busy }} onReplayOnboarding={() => setOnboardingOpen(true)} />
      <CodexStatus agents={state.agents} />
      {state.recovery && <div className={`recovery-banner ${state.recovery.code}`} role="status"><span>{t(`recovery.${state.recovery.code}`)}</span><button onClick={() => act({ type: "acknowledge_recovery" })} disabled={busy} aria-label={t("recovery.dismiss")} title={t("recovery.dismiss")}><X size={17} weight="bold" /></button></div>}
      {error && <div className="toast" role="alert"><span>{localizedError}</span><button onClick={dismissError} aria-label={t("toast.close")}><X size={17} weight="bold" /></button></div>}
      {onboardingOpen && <Onboarding onComplete={completeOnboarding} onViewChange={setView} />}
    </div>
  );
}
