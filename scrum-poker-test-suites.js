// Test suites for Scrum Poker v3

suite("P1 Room normalisation", function(t){
  t("PBT: result is [a-z0-9]", function(){
    fc.assert(fc.property(fc.string(), function(s){ return /^[a-z0-9]*$/.test(normaliseRoom(s)); }), {numRuns:200});
  });
  t("PBT: clean input unchanged", function(){
    fc.assert(fc.property(fc.stringMatching(), function(s){ return normaliseRoom(s)===s; }), {numRuns:100});
  });
  t("Unit: strips special chars", function(){ assert(normaliseRoom("Search Sprint!")=="searchsprint"); });
  t("Unit: empty stays empty", function(){ assert(normaliseRoom("")===""); });
});

suite("P2 Spectator exclusion", function(t){
  var uArb = fc.record({
    name: fc.string({minLength:1,maxLength:12}),
    vote: fc.option(fc.constantFrom.apply(null, CARD_VALUES), {nil:null}),
    oderId: fc.uuid(),
    spectator: fc.boolean()
  });
  t("PBT: getVoters has no spectators", function(){
    fc.assert(fc.property(fc.array(uArb,{minLength:0,maxLength:8}), function(users){
      var map={}; users.forEach(function(u){map[u.oderId]=u;});
      return getVoters(map).every(function(u){return !u.spectator;});
    }), {numRuns:150});
  });
  t("PBT: getSpectators are all spectators", function(){
    fc.assert(fc.property(fc.array(uArb,{minLength:0,maxLength:8}), function(users){
      var map={}; users.forEach(function(u){map[u.oderId]=u;});
      return getSpectators(map).every(function(u){return u.spectator===true;});
    }), {numRuns:150});
  });
  t("Unit: correct split", function(){
    var u={a:{name:"A",vote:"5",oderId:"a",spectator:false},b:{name:"B",vote:null,oderId:"b",spectator:true},c:{name:"C",vote:"3",oderId:"c",spectator:false}};
    assert(getVoters(u).length===2 && getSpectators(u).length===1);
  });
});

suite("P5 Vote statistics", function(t){
  var nv = fc.constantFrom("0","1","2","3","5","8","13","21","34");
  t("PBT: avg equals manual", function(){
    fc.assert(fc.property(fc.array(nv,{minLength:1,maxLength:12}), function(votes){
      var s=calculateStats(votes); if(!s)return false;
      var nums=votes.map(Number);
      return s.avg===(nums.reduce(function(a,b){return a+b;},0)/nums.length).toFixed(1);
    }), {numRuns:150});
  });
  t("PBT: min max correct", function(){
    fc.assert(fc.property(fc.array(nv,{minLength:1,maxLength:12}), function(votes){
      var s=calculateStats(votes); if(!s)return false;
      var nums=votes.map(Number);
      return s.min===Math.min.apply(null,nums) && s.max===Math.max.apply(null,nums);
    }), {numRuns:150});
  });
  t("PBT: non-numeric only null", function(){
    fc.assert(fc.property(fc.array(fc.constantFrom("?"), {minLength:1,maxLength:4}),
      function(v){return calculateStats(v)===null;}), {numRuns:100});
  });
  t("Unit: 3 5 8 avg=5.3", function(){ var s=calculateStats(["3","5","8"]); assert(s.avg==="5.3"&&s.min===3&&s.max===8,"avg="+s.avg); });
  t("Unit: single 13", function(){ var s=calculateStats(["13"]); assert(s.avg==="13.0"&&s.min===13&&s.max===13); });
});

suite("P11 Consensus detection", function(t){
  t("PBT: identical full", function(){
    fc.assert(fc.property(fc.constantFrom("1","2","3","5","8","13"),fc.integer({min:2,max:6}),
      function(v,n){return computeConsensus(Array(n).fill(v))==="full";}), {numRuns:100});
  });
  t("PBT: spread=1 near", function(){
    fc.assert(fc.property(fc.constantFrom("1","2","3","5","8"),fc.integer({min:1,max:3}),fc.integer({min:1,max:3}),
      function(base,a,b){return computeConsensus(Array(a).fill(base).concat(Array(b).fill(String(parseFloat(base)+1))))==="near";}), {numRuns:100});
  });
  t("PBT: all non-numeric na", function(){
    fc.assert(fc.property(fc.array(fc.constantFrom("?"),{minLength:1,maxLength:4}),
      function(v){return computeConsensus(v)==="n/a";}), {numRuns:100});
  });
  t("Unit: spread>1 none", function(){ assert(computeConsensus(["1","8","13"])==="none"); });
  t("Unit: single na", function(){ assert(computeConsensus(["5"])==="n/a"); });
  t("Unit: mixed spread=0 full", function(){ assert(computeConsensus(["5","5","?"])==="full"); });
});

suite("P10 Timer non-negative", function(t){
  t("PBT: remaining>=0", function(){
    fc.assert(fc.property(fc.integer({min:0,max:300}),fc.integer({min:0,max:50000}),
      function(dur,ex){return computeTimerRemaining(Date.now()-ex,dur,Date.now())>=0;}), {numRuns:200});
  });
  t("PBT: monotonically non-increasing", function(){
    fc.assert(fc.property(fc.integer({min:1,max:300}),fc.integer({min:0,max:500}),
      function(dur,off){var t0=Date.now();return computeTimerRemaining(t0-off,dur,t0)>=computeTimerRemaining(t0-off,dur,t0+300);}), {numRuns:200});
  });
  t("Unit: expired=0", function(){ assert(computeTimerRemaining(Date.now()-10000,5,Date.now())===0); });
  t("Unit: just started ~120", function(){ var r=computeTimerRemaining(Date.now(),120,Date.now()); assert(r>=119&&r<=120,"got "+r); });
});

suite("P6 History item", function(t){
  var uArb=fc.record({name:fc.string({minLength:1,maxLength:10}),vote:fc.constantFrom.apply(null,CARD_VALUES),oderId:fc.uuid(),spectator:fc.constant(false)});
  t("PBT: all fields non-empty", function(){
    fc.assert(fc.property(fc.array(uArb,{minLength:1,maxLength:6}),fc.string({minLength:1,maxLength:20}),fc.constantFrom.apply(null,CARD_VALUES),
      function(users,story,est){
        var map={}; users.forEach(function(u){map[u.oderId]=u;});
        var item=buildHistoryItem({users:map,currentStory:story},est);
        return item.story.length>0&&item.votes.length>0&&item.finalEstimate.length>0&&item.time.length>0;
      }), {numRuns:150});
  });
  t("Unit: correct shape", function(){
    var gs={users:{a:{name:"Alice",vote:"5",oderId:"a",spectator:false},b:{name:"Bob",vote:"8",oderId:"b",spectator:false}},currentStory:"SEARCH-1234"};
    var item=buildHistoryItem(gs,"5");
    assert(item.story==="SEARCH-1234"&&item.finalEstimate==="5"&&item.votes.length===2&&item.average==="6.5","avg="+item.average);
  });
});

suite("P7 History total", function(t){
  var iArb=fc.record({story:fc.constant("X"),votes:fc.constant([]),average:fc.constant("5"),finalEstimate:fc.oneof(fc.constantFrom("0","1","2","3","5","8","13"),fc.constantFrom("?")),time:fc.constant("00:00")});
  t("PBT: total=sum of numeric", function(){
    fc.assert(fc.property(fc.array(iArb,{minLength:0,maxLength:12}),function(h){
      var exp=h.filter(function(x){return !isNaN(parseFloat(x.finalEstimate));}).reduce(function(s,x){return s+parseFloat(x.finalEstimate);},0);
      return computeHistoryTotal(h)===exp;
    }), {numRuns:150});
  });
  t("Unit: 5+?+8+3=16", function(){ assert(computeHistoryTotal([{finalEstimate:"5"},{finalEstimate:"?"},{finalEstimate:"8"},{finalEstimate:"3"}])===16); });
});

suite("P9 CSV completeness", function(t){
  var iArb=fc.record({
    story: fc.string({minLength:1,maxLength:15}).map(function(s){return s.replace(/"/g,"'");}),
    finalEstimate: fc.constantFrom("1","2","3","5","8","13","?"),
    average: fc.constant("5.0"),
    votes: fc.array(fc.record({name:fc.string({minLength:1,maxLength:8}),vote:fc.constantFrom("5","8","3")}),{minLength:1,maxLength:3}),
    time: fc.constant("12:00")
  });
  t("PBT: has header and TOTAL", function(){
    fc.assert(fc.property(fc.array(iArb,{minLength:1,maxLength:8}),function(h){
      var csv=buildCsv(h,"room"); return csv.indexOf("Ticket/Story")===0 && csv.indexOf("TOTAL")>-1;
    }), {numRuns:100});
  });
  t("Unit: TOTAL=13", function(){
    var h=[{story:"A",finalEstimate:"5",average:"5",votes:[],time:"t"},{story:"B",finalEstimate:"?",average:"?",votes:[],time:"t"},{story:"C",finalEstimate:"8",average:"8",votes:[],time:"t"}];
    assert(buildCsv(h,"r").indexOf("TOTAL,13")>-1);
  });
});

suite("getVotersForCard", function(t){
  t("Returns correct voters", function(){
    var u={a:{name:"Alice",vote:"5",oderId:"a",spectator:false},b:{name:"Bob",vote:"8",oderId:"b",spectator:false},c:{name:"Carol",vote:"5",oderId:"c",spectator:false}};
    var v=getVotersForCard(u,"5"); assert(v.length===2&&v.indexOf("Alice")>-1&&v.indexOf("Carol")>-1);
  });
  t("Excludes spectators", function(){
    var u={a:{name:"Alice",vote:"5",oderId:"a",spectator:false},b:{name:"SM",vote:"5",oderId:"b",spectator:true}};
    var v=getVotersForCard(u,"5"); assert(v.length===1&&v[0]==="Alice");
  });
  t("Empty when no match", function(){ assert(getVotersForCard({a:{name:"A",vote:"3",oderId:"a",spectator:false}},"13").length===0); });
});

suite("suggestFinalEstimate", function(t){
  t("Most common vote", function(){
    var u={a:{vote:"5",spectator:false},b:{vote:"5",spectator:false},c:{vote:"8",spectator:false}};
    assert(suggestFinalEstimate(u)==="5");
  });
  t("Ignores spectators", function(){
    var u={a:{vote:"13",spectator:false},b:{vote:"8",spectator:true},c:{vote:"13",spectator:false}};
    assert(suggestFinalEstimate(u)==="13");
  });
});

suite("roundToFibonacci", function(t){
  var fibs = [0,1,2,3,5,8,13,21,34];
  t("PBT: result is always a Fibonacci card value", function(){
    fc.assert(fc.property(fc.float({min:0,max:34}), function(v){
      return fibs.includes(roundToFibonacci(v));
    }), {numRuns:200});
  });
  t("PBT: result is the nearest Fibonacci", function(){
    fc.assert(fc.property(fc.float({min:0,max:34}), function(v){
      var r = roundToFibonacci(v);
      var dist = Math.abs(r - v);
      return fibs.every(function(f){ return Math.abs(f - v) >= dist; });
    }), {numRuns:200});
  });
  t("Unit: 18 → 21", function(){ assert(roundToFibonacci(18)===21); });
  t("Unit: 4  → 3 or 5 (equidistant — nearest wins)", function(){ var r=roundToFibonacci(4); assert(r===3||r===5); });
  t("Unit: 6  → 5", function(){ assert(roundToFibonacci(6)===5); });
  t("Unit: 7  → 8", function(){ assert(roundToFibonacci(7)===8); });
  t("Unit: 0  → 0", function(){ assert(roundToFibonacci(0)===0); });
  t("Unit: 34 → 34", function(){ assert(roundToFibonacci(34)===34); });
});
