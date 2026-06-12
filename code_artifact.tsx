import React, { useState, useEffect } from 'react';
import { Flame, BookOpen, ArrowDownCircle, Heart, Users, MapPin, Calendar, Quote, CheckCircle2 } from 'lucide-react';

// Заглушки для картинок. 
// ВАЖНО: Замените эти URL на пути к вашим сгенерированным картинкам в проекте DGD-namahatta.
const images = {
  hero: "https://images.unsplash.com/photo-1484069560501-87d72b0c3669?q=80&w=1600&auto=format&fit=crop", // Замените на ретро-пару в колодце
  burden: "https://images.unsplash.com/photo-1581454088019-21cb03cf565e?q=80&w=1600&auto=format&fit=crop", // Замените на человека с холодильником
  escape: "https://images.unsplash.com/photo-1505506874110-6a7a4f98831a?q=80&w=1600&auto=format&fit=crop" // Замените на лестницу из колодца
};

export default function App() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-red-200">
      
      {/* 1. HERO SECTION (Глянцевая иллюзия) */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-900 text-white">
        <div 
          className="absolute inset-0 z-0 opacity-40 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${images.hero})`,
            transform: `translateY(${scrollY * 0.5}px)` 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/80 to-slate-900 z-10" />
        
        <div className="relative z-20 max-w-4xl mx-auto px-6 text-center mt-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 mb-8 uppercase tracking-widest text-xs font-bold">
            <Flame size={14} /> Откровения бывших брахмачари
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight uppercase">
            Мы все катимся в <br/> <span className="text-red-500">тёмный колодец</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 font-light mb-10 max-w-2xl mx-auto">
            Посвящается Авьянге прабху и всем, кто думал, что семейная жизнь — это просто совместная санкиртана.
          </p>
          <ArrowDownCircle className="mx-auto animate-bounce text-slate-500 w-10 h-10" />
        </div>
      </section>

      {/* 2. THE PROBLEM (Столкновение с реальностью) */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Ожидание vs. Реальность</h2>
          <div className="text-lg leading-relaxed text-slate-600 space-y-6">
            <p>
              Помнишь, как мы жили в ашраме? Подъем в 4 утра, киртаны до потери голоса, полное отсутствие забот о том, откуда берется прасад на тарелке и кто оплачивает счета за электричество. Мы летали в духовных облаках.
            </p>
            <p className="font-semibold text-slate-800">
              А потом мы решили стать грихастхами.
            </p>
            <p>
              Внезапно оказалось, что духовный прогресс теперь измеряется не часами прочитанной джапы, а умением не сойти с ума во время ремонта, найти деньги на подгузники и сохранить мирное умонастроение, когда планы рушатся в десятый раз за день. Ощущение, что ты сидих в колодце, из которого не выбраться — это не паранойя. Это суровая философия.
            </p>
          </div>
        </div>
      </section>

      {/* 3. SHASTRIC EVIDENCE (Научное подтверждение) */}
      <section className="py-24 px-6 bg-slate-100 border-y border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <BookOpen className="mx-auto w-12 h-12 text-slate-400 mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold">Что говорят об этом Шастры?</h2>
            <p className="text-slate-500 mt-4">Диагноз поставлен Шрилой Прабхупадой предельно точно.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Цитата 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100 rounded-bl-full -z-0 opacity-50"></div>
              <div className="relative z-10">
                <h3 className="text-sm font-bold text-amber-600 tracking-wider uppercase mb-4">Предупреждение</h3>
                <blockquote className="text-xl font-serif text-slate-800 mb-6 italic">
                  «Как правило, мужчине очень трудно развивать духовное сознание, если он женат. Он привязывается к семье и к чувственным наслаждениям. Поэтому его духовное развитие протекает очень медленно либо почти совсем прекращается».
                </blockquote>
                <p className="text-sm font-semibold text-slate-500">— Чайтанья-чаритамрита, Антья-лила, 13.112</p>
              </div>
            </div>

            {/* Цитата 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-100 rounded-bl-full -z-0 opacity-50"></div>
              <div className="relative z-10">
                <h3 className="text-sm font-bold text-red-600 tracking-wider uppercase mb-4">Диагноз "Темный колодец"</h3>
                <blockquote className="text-xl font-serif text-slate-800 mb-6 italic">
                  «В Шримад-Бхагаватам семейная жизнь часто сравнивается с темным колодцем (андха-купа). Человек, упавший в такой колодец, не может выбраться из него самостоятельно».
                </blockquote>
                <p className="text-sm font-semibold text-slate-500">— Шримад-Бхагаватам 5.14.1</p>
              </div>
            </div>
            
            {/* Картинка между цитатами */}
            <div className="md:col-span-2 rounded-2xl overflow-hidden h-64 md:h-96 relative my-4 shadow-inner">
               <img src={images.burden} alt="The burden of family life" className="absolute inset-0 w-full h-full object-cover object-center filter grayscale contrast-125" />
               <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply"></div>
               <div className="absolute bottom-6 left-6 right-6">
                 <p className="text-white text-lg font-medium text-center shadow-sm">"Иногда кажется, что ты пытаешься бежать марафон с холодильником на спине."</p>
               </div>
            </div>

            {/* Цитата 3 */}
            <div className="md:col-span-2 bg-slate-800 text-white p-8 md:p-12 rounded-2xl shadow-xl relative overflow-hidden">
               <div className="relative z-10 text-center max-w-3xl mx-auto">
                 <Heart className="w-8 h-8 mx-auto text-red-500 mb-6 opacity-80" />
                 <blockquote className="text-2xl font-serif leading-relaxed mb-6">
                  «...каждый, особенно семейный человек, должен очистить свой ум от всех мирских привязанностей и вручить себя лотосным стопам Господа... В этом заключается суть наставлений».
                 </blockquote>
                 <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">— Шримад-Бхагаватам 1.19.41</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. GURU'S GUIDANCE (Слова Духовного учителя) */}
      <section className="py-24 px-6 bg-amber-50 relative overflow-hidden">
        {/* Декоративный фон */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <Quote className="w-16 h-16 text-amber-300 mb-6" />
          <h2 className="text-3xl font-bold mb-6 text-slate-800">Инструкция по выживанию в колодце</h2>
          <p className="text-lg text-slate-600 mb-10 leading-relaxed border-l-4 border-amber-400 pl-4">
            Как садхана, я постоянно размышляю над словами моего Духовного учителя, сказанными 22 сентября 2019 года. В тот день мы с супругой (Ади Лакшми матаджи) получили даршан Е.С. Шрилы Бхакти Вигьяны Госвами Махараджа, вступая в семейную жизнь. Эти слова — наш спасательный круг.
          </p>

          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-lg border border-amber-100">
            <div className="space-y-6 text-slate-700 text-lg leading-relaxed font-serif">
              <p>
                <span className="text-amber-600 font-bold text-xl block mb-2">Об ожиданиях и служении:</span>
                «Смысл простой, вы наверняка его знаете: надо стараться не ожидать ничего друг от друга, а служить, и наши ожидания естественным образом исполнятся, когда мы будем служить, то есть пытаться делать то, что нужно другому человеку. Если мы все время будем думать о своих ожиданиях от этих отношений, то наша жизнь превратится в ад. Потому что всегда будет что-то не так, не то, всегда будет неудовлетворенность, неудовлетворенность будет накапливаться, раздражение будет накапливаться.»
              </p>
              
              <p>
                «Если мы не будем особенно на этом сосредотачиваться, а будем с благодарностью принимать то, что есть у другого и то, что другой нам дает, при этом стараться делать что-то и в этом находить счастье, тогда жизнь будет очень счастливой, не будет никаких поводов для недовольств.»
              </p>

              <p>
                «Когда оба человека таким образом настроены, то Кришна вам разум даст, чтобы понять, что нужно другому человеку, как нужно себя вести. А если мы постоянно думаем о том, что нужно мне от этих отношений, то наш разум отключается и мы при этом не чувствуем другого человека, становимся все более и более черствыми.»
              </p>

              <p>
                «Понятно, что мы запрограммированы на ожидания, мы хотим что-то получить, но это не должно быть доминантой наших отношений. На самом деле человек очень рад, когда он может что-то дать. Надо с радостью давать, что мы можем дать и с благодарностью принимать то, что дает другой. Тогда эти две эмоции — радость и благодарность — будут преобладать в нашем сердце и давать нам опыт счастья. Когда вместо радости у нас недовольство от того, что мы чего-то не получили и претензии к другому человеку, что он что-то не дал, тогда очень скучно все становится. Простая вещь, которую очень сложно исполнить.»
              </p>

              <div className="pt-6 mt-6 border-t border-amber-100">
                <span className="text-amber-600 font-bold text-xl block mb-4">Два важнейших правила:</span>
                <ul className="space-y-4">
                  <li className="flex gap-4 items-start">
                    <CheckCircle2 className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                    <span><strong>Научиться прощать.</strong> «Потому что какие-то ошибки все делают, какую-то грубость, неловкость допускают. Мы все разные люди, у нас воспитание разное и разные ценности. Поэтому надо терпеть, прощать.»</span>
                  </li>
                  <li className="flex gap-4 items-start">
                    <CheckCircle2 className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                    <span><strong>Говорить, когда больно.</strong> «Когда другой человек причинил какую-то боль, надо обязательно ему сказать. Не сразу — когда остынешь. Не надо копить ее внутри, не нужно копить какой-то негатив, нужно давать ему выход.»</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. THE SOLUTION SUMMARY (Резюме) */}
      <section className="py-24 px-6 bg-white relative overflow-hidden border-t border-slate-100">
         <div className="max-w-4xl mx-auto">
           <div className="flex flex-col md:flex-row items-center gap-12">
             <div className="md:w-1/2 relative group">
                <div className="absolute inset-0 bg-amber-500 rounded-2xl rotate-3 transition-transform group-hover:rotate-6"></div>
                <img src={images.escape} alt="Ladder out of well" className="relative rounded-2xl shadow-xl -rotate-2 group-hover:-rotate-0 transition-transform duration-500" />
             </div>
             <div className="md:w-1/2">
               <h2 className="text-3xl font-bold mb-6">Как стать лестницей друг для друга?</h2>
               <div className="space-y-4 text-slate-600">
                 <p>
                   Грихамедхи — это тот, кто обустраивает колодец, вешает там обои и проводит интернет, забыв, что он в яме.
                 </p>
                 <p>
                   Грихастха — это тот, кто осознает, где он находится, и использует семью как лестницу, чтобы выбраться наверх. Да, прогресс замедлился. Да, мы стали тяжелее на подъем. 
                 </p>
                 <p className="font-medium text-slate-800">
                   Но именно здесь, в этой жесткой мясорубке обязанностей, перемалывается наше ложное эго. Ожидания сгорают, и остается только чистое служение и прощение. То, что в ашраме казалось святостью, здесь проходит реальную проверку на прочность.
                 </p>
               </div>
             </div>
           </div>
         </div>
      </section>

      {/* 6. CALL TO ACTION (Встреча) */}
      <section className="py-20 px-6 bg-gradient-to-br from-amber-500 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Users className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-4xl md:text-5xl font-black mb-6 drop-shadow-sm">Групповая терапия в колодце</h2>
          <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            Давайте обсудим это вживую. Как сохранить искру, не сойти с ума от быта и остаться преданными в этом суровом ашраме.
          </p>
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-lg mx-auto transform hover:scale-105 transition-transform duration-300">
            <h3 className="text-2xl font-bold mb-6">Следующая Нама-хатта</h3>
            <div className="space-y-4 text-lg text-left w-fit mx-auto">
              <div className="flex items-center gap-4">
                <Calendar className="w-6 h-6 text-amber-200" />
                <span><strong className="text-white">20 июня 2026</strong></span>
              </div>
              <div className="flex items-center gap-4">
                <MapPin className="w-6 h-6 text-amber-200" />
                <span>Алматы, у <strong>Шачисуты</strong></span>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-white/20">
              <p className="text-sm font-medium uppercase tracking-widest opacity-80">Ждем всех (даже с детьми)</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}