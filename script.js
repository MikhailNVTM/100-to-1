const state={questions:[],current:0,score:0,answered:false};
const el={score:document.querySelector('#score'),counter:document.querySelector('#counter'),progress:document.querySelector('#progress'),question:document.querySelector('#question'),hint:document.querySelector('#hint'),answers:document.querySelector('#answers'),result:document.querySelector('#result'),message:document.querySelector('#message'),next:document.querySelector('#next'),error:document.querySelector('#error')};

async function load(){
  try{
    const response=await fetch('questions.json',{cache:'no-store'});
    if(!response.ok)throw new Error(response.status);
    state.questions=await response.json();
    if(!Array.isArray(state.questions)||!state.questions.length)throw new Error('Пустой список');
    render();
  }catch(error){console.error(error);el.question.textContent='Вопросы не загрузились';el.hint.hidden=true;el.error.hidden=false}
}

function render(){
  const item=state.questions[state.current];state.answered=false;
  el.counter.textContent=`Вопрос ${state.current+1} из ${state.questions.length}`;
  el.progress.style.width=`${(state.current+1)/state.questions.length*100}%`;
  el.question.textContent=item.question;el.answers.replaceChildren();el.answers.hidden=false;el.result.hidden=true;
  item.answers.forEach((answer,index)=>{
    const button=document.createElement('button');button.type='button';button.className='answer';button.dataset.points=answer.points;
    button.innerHTML=`<span class="bar"></span><span class="number">${index+1}</span><span class="name">${answer.text}</span><span class="points">${answer.points}</span>`;
    button.addEventListener('click',()=>choose(button,answer));el.answers.append(button);
  });
}

function choose(selected,answer){
  if(state.answered)return;state.answered=true;state.score+=answer.points;el.score.textContent=state.score;
  const max=Math.max(...state.questions[state.current].answers.map(answer=>answer.points));
  el.answers.querySelectorAll('.answer').forEach(button=>{button.disabled=true;button.classList.add('revealed');if(button===selected)button.classList.add('selected');requestAnimationFrame(()=>button.querySelector('.bar').style.width=`${Number(button.dataset.points)/max*100}%`)});
  el.message.textContent=`Ваш выбор принёс ${pointsText(answer.points)}.`;
  el.next.textContent=state.current===state.questions.length-1?'Посмотреть результат':'Следующий вопрос';el.result.hidden=false;
}

function next(){
  if(state.current<state.questions.length-1){state.current++;render();return}
  if(el.answers.hidden){state.current=0;state.score=0;el.score.textContent='0';el.hint.textContent='Какой ответ, по вашему мнению, выбрали чаще всего?';render();return}
  el.counter.textContent='Игра завершена';el.question.textContent=`Ваш результат: ${state.score}`;el.hint.textContent='Вы прошли все вопросы. Позже здесь можно добавить таблицу лидеров.';el.answers.hidden=true;el.message.textContent='Спасибо за участие!';el.next.textContent='Пройти ещё раз';el.result.hidden=false;
}

function pointsText(value){const n=value%100,d=value%10;let word='баллов';if(n<11||n>14){if(d===1)word='балл';else if(d>=2&&d<=4)word='балла'}return`${value} ${word}`}
el.next.addEventListener('click',next);load();
