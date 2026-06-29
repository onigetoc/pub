import type { Sections } from './types.js';
import { WEIGHTS } from './types.js';

const EN_FUNCTION_WORDS = [
  'a','an','the','and','or','but','in','on','at','to','for','of','with','by','from',
  'is','are','was','were','be','been','being','have','has','had','do','does','did',
  'will','would','should','could','may','might','shall','must','can','need',
  'this','that','these','those','i','you','he','she','we','they',
  'it','its','me','him','her','us','them','my','your','his','our','their',
  'what','which','who','whom','whose','where','when','why','how',
  'all','each','every','both','few','more','most','other','some','such',
  'no','nor','not','only','own','same','so','than','too','very','just',
  'any','if','up','down','out','off','over','under','then','here','there',
];

const FR_FUNCTION_WORDS = [
  'le','la','les','un','une','des','du','de','au','aux',
  'a','en','par','pour','sur','sous','avec','sans','dans',
  'entre','vers',
];

const STOPWORDS_EN = new Set([
  ...EN_FUNCTION_WORDS,
  'up','about','into','through','during','before','after','above','below','between',
  'once','because','until','while','although','though',
  'again','further',
  'one','two','three','new','also','even','well','back','still','way',
  'get','got','go','goes','went','gone','come','came','see','saw','look','use','used',
  'make','made','know','take','good','time','like','people','year','said','say','think',
  'now','however','let','set','put',
  'much','many','long','little','first','last','next','old','high','right','big',
  'great','small','real','large','able','away','often','around','never','always',
  'already','off','far','things','part','place','case','hand',
  'world','life','day','give','given','different','number','work',
  'without','within','along','following','across','behind','beyond','plus','except',
  'per','cent','via','vs','ie','eg','etc',
  'don','won','didn','isn','wasn','aren','weren','hasn','haven','hadn','doesn',
  'couldn','shouldn','wouldn','s','t','ll','ve','d','m','re',
  'having','doing','going','says','tell','told','ask','asked','want','wanted','getting',
]);

const STOPWORDS_FR = new Set([
  ...FR_FUNCTION_WORDS,
  'je','tu','il','elle','on','nous','vous','ils','elles',
  'me','te','se','lui','leur','eux','moi','toi','soi',
  'ce','cet','cette','ces','celui','celle','ceux','celles',
  'qui','que','quoi','dont','ou','lequel','laquelle','lesquels','lesquelles',
  'quel','quelle','quels','quelles',
  'ceci','cela','ca',
  'chez','contre','depuis','pendant','apres','avant',
  'devant','derriere','hors','selon','malgre','durant',
  'et','ou','mais','donc','car','ni','que','si','comme','quand',
  'lorsque','puisque','parce','afin','alors','puis',
  'ne','pas','plus','moins','tres','bien','mal','aussi','encore',
  'toujours','jamais','souvent','parfois','deja','ici','la',
  'trop','peu','beaucoup','assez','tout','tous','toute','toutes',
  'meme','autre','autres','chaque','plusieurs','quelques','certains','certaines',
  'aucun','aucune',
  'etre','avoir','est','sont','etait','ete','sera','seront',
  'fait','faire','peut','peuvent','doit','doivent','faut',
  'ai','as','avons','avez','ont','avait','avaient','aura','auront',
  'suis','es','sommes','etes',
  'va','vont','allait','allaient','aller',
  'son','sa','ses','mon','ma','mes','ton','ta','tes','notre','nos','votre','vos','leur','leurs',
  'y','en','dont','soit','non','oui',
  'ainsi','cependant','toutefois','neanmoins','pourtant',
  'egalement','notamment','plutot','environ','lors','des',
  'celui-ci','celle-ci','celui-la','celle-la',
  'aujourd','hui',
  'ans','dix','deux','trois','quatre','cinq','six','sept','huit','neuf',
  'cent','mille','premier','premiere','fois',
]);

const STOPWORDS_COMMON = new Set([
  'nbsp','amp','quot','apos','gt','lt','href','class',
  'id','div','span','img','alt','src','style','type','value','data','html',
  'body','head','script','link','meta','title','content','name','rel','lang',
  'charset','utm','http','https','www','com','org','net','edu','gov',
  'null','undefined','true','false','var','let','const','function','return','readme','main',
  ...EN_FUNCTION_WORDS,
  'one','two','three','four','five','six','seven','eight','nine','ten','best','better',
]);

export function getStopwords(lang: string): Set<string> {
  const code = (lang || 'en').toLowerCase().split('-')[0];
  const langSet = code === 'fr' ? STOPWORDS_FR : STOPWORDS_EN;
  return new Set([...langSet, ...STOPWORDS_COMMON]);
}

export const FILLER_WORDS = new Set([
  ...EN_FUNCTION_WORDS, ...FR_FUNCTION_WORDS,
  'sa','ca','il','elle','ce','ces',
  'into','also',
  'par','sur','dans','pour','avec','sans','entre','vers',
]);

export const COMMON_WORDS = new Set([
  'new','old','big','small','great','first','last','next','long','high','low',
  'good','bad','best','worst','top','real','free','full','open','close',
  'back','down','over','under','after','before','just','still','even','much',
  'most','more','less','very','too','well','far','near','early','late',
  'made','making','makes','make','take','takes','taking','give','gives',
  'get','gets','getting','got','set','sets','run','runs','running',
  'pull','pulls','pulling','push','deal','deals','debt','stock','stocks',
  'market','markets','trade','trades','trading','price','prices','rise','rises',
  'fall','falls','drop','drops','hit','hits','record','breaking','history',
  'time','times','day','days','week','year','years','world','life','way',
  'work','works','working','help','helps','start','end','part','point',
  'group','number','fact','case','place','home','house','state','city',
  'turn','turns','look','looks','show','shows','move','moves','change',
  'play','plays','keep','keeps','think','call','calls','find','finds',
  'obsessed','obsess','plan','plans','report','reports','update','updates',
  'build','builds','buy','buys','sell','sells','win','wins','lose','cut',
  'pay','pays','lead','leads','hold','holds','live','lives','bring','talk',
  'grand','petit','nouveau','nouvelle','bon','bonne','beau','belle',
  'premier','dernier','autre','meme','tout','fait','mise','jour',
  'prix','mise','mort','vie','guerre','monde','pays','roi','reine',
  'histoire','temps','homme','femme','fils','fille','pere','mere',
]);

export const ACRONYM_BLACKLIST = new Set([
  'isbn','issn','oclc','doi','pmid','arxiv','html','http','https',
  'css','php','sql','xml','json','pdf','url','api','sdk','dns',
  'ftp','ssh','ssl','tls','tcp','udp','rgb','hex','readme',
]);

/* ── Tokenizer ──────────────────────────────────────────────── */

export function tokenize(text: string): string[] {
  return (text || '').toLowerCase().match(/[\p{L}][\p{L}'\u2019-]{1,40}/gu) || [];
}

function resolveApostrophe(w: string): string {
  const idx = w.search(/[''\u2019]/);
  if (idx <= 0 || idx >= w.length - 1) return w;
  const prefix = w.substring(0, idx);
  const suffix = w.substring(idx + 1);
  return prefix.length <= 2 ? suffix : prefix;
}

function cleanToken(w: string): string {
  w = w.replace(/^['"\u2019\u2018]+|['"\u2019\u2018]+$/g, '');
  return resolveApostrophe(w);
}

function isValidToken(w: string, stopwords: Set<string>): boolean {
  if (stopwords.has(w)) return false;
  if (w.length < 3) return false;
  if (/^\d+$/.test(w)) return false;
  const cl = w.replace(/['\u2019-]/g, '');
  return cl.length >= 2;
}

export function filterTokens(tokens: string[], stopwords: Set<string>): string[] {
  return tokens.map(cleanToken).filter(w => isValidToken(w, stopwords));
}
