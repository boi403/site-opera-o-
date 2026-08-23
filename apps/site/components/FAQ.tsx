
import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqData: FAQItem[] = [
    {
      question: "Quais são os horários de check-in e check-out?",
      answer: "O check-in inicia às 14:00h e o check-out deve ser realizado até as 12:00h. Caso necessite de horários diferenciados, entre em contato para verificar disponibilidade de early check-in ou late check-out."
    },
    {
      question: "O café da manhã está incluso na diária?",
      answer: "Sim! Todos os nossos hóspedes desfrutam de um café da manhã completo e diversificado, com frutas, pães, bolos e opções regionais, servido diariamente em nosso salão."
    },
    {
      question: "Possuem estacionamento próprio?",
      answer: "Sim, oferecemos estacionamento privativo e monitorado 24h para todos os nossos hóspedes, garantindo total segurança para o seu veículo durante a estadia."
    },
    {
      question: "Quais são as formas de pagamento aceitas?",
      answer: "Trabalhamos com as principais bandeiras de cartão de crédito e débito, pagamentos via PIX e dinheiro. Para faturamento empresarial, favor entrar em contato com nosso setor financeiro."
    },
    {
      question: "O hotel possui Wi-Fi?",
      answer: "Sim, disponibilizamos Wi-Fi de alta velocidade em todas as áreas do hotel, incluindo quartos e áreas comuns, como cortesia para nossos hóspedes."
    }
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <HelpCircle className="w-6 h-6 text-[#E31B23]" />
            <span className="text-[#E31B23] font-bold uppercase tracking-widest text-xs">Dúvidas Frequentes</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#002D44] serif">Perguntas Frequentes</h2>
          <div className="w-16 h-1 bg-[#FFD700] mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div 
              key={index} 
              className={`border rounded-2xl transition-all duration-300 ${
                openIndex === index ? 'border-[#002D44] bg-slate-50' : 'border-slate-200 bg-white'
              }`}
            >
              <button
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                onClick={() => toggleAccordion(index)}
              >
                <span className={`font-bold text-lg transition-colors ${
                  openIndex === index ? 'text-[#002D44]' : 'text-slate-700'
                }`}>
                  {item.question}
                </span>
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 text-slate-400 ${
                  openIndex === index ? 'rotate-180 text-[#002D44]' : ''
                }`} />
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-6 pt-0 text-slate-600 border-t border-slate-100 mt-2 leading-relaxed">
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-500 mb-4 italic">Ainda tem alguma dúvida?</p>
          <a 
            href="#contato" 
            className="inline-flex items-center gap-2 text-[#E31B23] font-bold hover:underline"
          >
            Fale conosco diretamente
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
