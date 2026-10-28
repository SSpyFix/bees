export const BADGE_RANKS=["Junior","Cadet","Hotshot","Ace","Master","Grandmaster"];
export const BADGE_TICKETS=[5,10,15,25,40];
export type BadgeDefinition={id:string;name:string;thresholds:number[];counter:string;bonus:string};
const fields=["sunflower","dandelion","mushroom","blue","clover","spider","bamboo","strawberry","pineapple","stump","cactus","pumpkin","pine","rose","mountain","coconut","pepper"];
const bonuses:Record<string,string>={sunflower:"Capacity",dandelion:"Honey at Hive",mushroom:"Instant Red Conversion",blue:"Instant Blue Conversion",clover:"Loot Luck",spider:"White Pollen",bamboo:"Blue Pollen",strawberry:"Red Pollen",pineapple:"Instant White Conversion",stump:"Tool Pollen",cactus:"Instant Conversion",pumpkin:"Convert Rate at Hive",pine:"Blue Field Capacity",rose:"Red Field Capacity",mountain:"Gifted Bee Pollen",coconut:"White Pollen",pepper:"Flame Pollen"};
export const BADGES:BadgeDefinition[]=[
  {id:"honey",name:"Honey",counter:"earn",thresholds:[1e6,1e7,1e8,1e9,2e10],bonus:"Convert Rate"},
  {id:"quests",name:"Quest",counter:"quest",thresholds:[10,50,250,1000,5000],bonus:"Capacity"},
  {id:"ability",name:"Ability",counter:"ability",thresholds:[2500,25000,100000,1e6,5e6],bonus:"Capacity"},
  {id:"playtime",name:"Playtime",counter:"time",thresholds:[28800,86400,604800,2592000,8640000],bonus:"Bee Movespeed"},
  {id:"battle",name:"Battle",counter:"battle",thresholds:[100,1000,10000,50000,500000],bonus:"Critical Power"},
  {id:"goo",name:"Goo",counter:"goo",thresholds:[5e5,5e6,5e7,5e8,1e10],bonus:"Honey Per Pollen"},
  ...fields.map(id=>({id,name:id==="blue"?"Blue Flower":id==="pine"?"Pine Tree":id==="mountain"?"Mountain Top":id[0].toUpperCase()+id.slice(1),counter:`field:${id}`,thresholds:id==="mountain"?[1e8,1e10,1e12,1e14,1e15]:["coconut","pepper"].includes(id)?[5e7,5e8,5e9,5e10,1e12]:[250000,2500000,25000000,250000000,5000000000],bonus:bonuses[id]})),
];

export const RECIPES:Record<string,Record<string,number>>={
  redExtract:{strawberry:50,jelly:10},blueExtract:{blueberry:50,jelly:10},
  oil:{sunflowerSeed:50,jelly:10},enzymes:{pineapple:50,jelly:10},glue:{gumdrops:50,jelly:10},
  gumdrops:{pineapple:3,strawberry:3,blueberry:3},moonCharm:{jelly:1,pineapple:5,gumdrops:5},
  glitter:{moonCharm:25,magicBean:1},starJelly:{jelly:100,glitter:3},
  tropicalDrink:{coconut:10,enzymes:2,oil:2},
};
export const SPRINKLERS=[
  {name:"Basic Sprinkler",cost:1111111,count:1,radius:7,power:7,rate:5,setup:6,color:"#b68c53"},
  {name:"Silver Soakers",cost:22222222,count:2,radius:7,power:7,rate:4.5,setup:5,color:"#c5d2df"},
  {name:"Golden Gushers",cost:333333333,count:3,radius:8,power:8,rate:4.5,setup:5,color:"#f8cf31"},
  {name:"Diamond Drenchers",cost:4444444444,count:4,radius:8,power:9,rate:4,setup:4,color:"#64c7f4"},
  {name:"The Supreme Saturator",cost:55555555555,count:1,radius:16,power:10,rate:1,setup:3,color:"#1d99ff"},
];
