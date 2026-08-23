
import React, { useState } from 'react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Reserva',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailTo = "palacehotelaraguaia@gmail.com";
    const body = `Nome: ${formData.name}%0D%0AEmail: ${formData.email}%0D%0AMensagem: ${formData.message}`;
    const mailtoUrl = `mailto:${emailTo}?subject=${encodeURIComponent(formData.subject)}&body=${body}`;
    window.location.href = mailtoUrl;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <section id="contato" className="py-20 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#002D44] mb-2">Entre em contato conosco</h2>
            <p className="text-slate-500">Tire suas dúvidas ou solicite uma cotação personalizada.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nome Completo</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#002D44] focus:border-transparent transition-all"
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">E-mail</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#002D44] focus:border-transparent transition-all"
                  placeholder="exemplo@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Assunto</label>
              <select 
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#002D44] focus:border-transparent transition-all"
              >
                <option value="Reserva">Reserva</option>
                <option value="Eventos Corporativos">Eventos Corporativos</option>
                <option value="Dúvidas Gerais">Dúvidas Gerais</option>
                <option value="Trabalhe Conosco">Trabalhe Conosco</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Mensagem</label>
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#002D44] focus:border-transparent transition-all"
                placeholder="Como podemos ajudar?"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-[#002D44] text-white py-4 rounded-lg font-bold uppercase tracking-widest hover:bg-[#003d5c] transition-all shadow-md active:scale-[0.98]"
            >
              Enviar Mensagem via E-mail
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
