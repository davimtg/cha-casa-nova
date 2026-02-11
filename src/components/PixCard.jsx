import React, { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { PixPayload } from '../utils/pix';

export default function PixCard() {
    const [copied, setCopied] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState(null); // value in number (e.g. 50.00)
    const [rawValue, setRawValue] = useState(0); // Integer cents (e.g. 500 for R$ 5,00)
    const [payload, setPayload] = useState('');

    // CONFIGURAÇÃO DO PIX (Atualizado com seus dados)
    const PIX_KEY = "davimtg2012+nu@gmail.com";
    const PIX_NAME = "Davi e Larissa";
    const PIX_CITY = "Rio de Janeiro";

    // Helper to format display value
    const formatCurrency = (cents) => {
        return (cents / 100).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };

    // ATM-style input logic using KeyDown to ignore caret position
    const handleKeyDown = (e) => {
        // Allow navigation keys
        if (['Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
            return;
        }

        // Handle Backspace
        if (e.key === 'Backspace') {
            e.preventDefault();
            setRawValue(prev => Math.floor(prev / 10));
            setSelectedAmount(null);
            return;
        }

        // Handle Numbers
        if (/^[0-9]$/.test(e.key)) {
            e.preventDefault();
            const digit = parseInt(e.key, 10);

            setRawValue(prev => {
                const newValue = (prev * 10) + digit;
                // Simple safety cap to avoid overflow/nonsense values
                if (newValue > 100000000) return prev;
                return newValue;
            });
            setSelectedAmount(null);
        }
    };

    useEffect(() => {
        // Calculate amount for payload
        // If preset selected, use it. If not, use rawValue / 100
        const amount = selectedAmount ? selectedAmount : (rawValue / 100);

        const pix = new PixPayload({
            key: PIX_KEY,
            name: PIX_NAME,
            city: PIX_CITY,
            value: amount || null, // If 0, generic payload
            txid: 'CHADECASA2025'
        });

        setPayload(pix.generate());
    }, [selectedAmount, rawValue]);

    const handleCopy = () => {
        navigator.clipboard.writeText(payload);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const PRESETS = [50, 100, 200];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
            {/* Header - Compacted */}
            <div className="bg-orange-100/50 p-4 flex flex-col items-center justify-center text-center space-y-1 relative overflow-hidden shrink-0">
                <div className="bg-white p-2 rounded-xl shadow-sm mb-1 relative z-10">
                    {payload && (
                        <QRCodeCanvas
                            value={payload}
                            size={110}
                            fgColor="#ea580c" // Orange-600
                            level={"M"}
                        />
                    )}
                </div>
                <h3 className="text-lg font-bold text-orange-800 font-serif relative z-10">Presente via Pix</h3>
                <p className="text-xs text-orange-700/80 max-w-[180px] relative z-10">
                    Escaneie ou escolha um valor.
                </p>
            </div>

            {/* Body - Compacted */}
            <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">

                {/* Value Selection */}
                <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                        {PRESETS.map(val => (
                            <button
                                key={val}
                                onClick={() => { setSelectedAmount(val); setRawValue(0); }}
                                className={`
                                    py-2 px-1 rounded-lg text-xs font-bold transition-all border
                                    ${selectedAmount === val
                                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-orange-50'
                                    }
                                `}
                            >
                                R$ {val}
                            </button>
                        ))}
                    </div>

                    {/* ATM Style Input */}
                    <div className={`
                        relative rounded-xl border-2 transition-all overflow-hidden bg-slate-50
                        ${!selectedAmount && rawValue > 0 ? 'border-orange-400 ring-2 ring-orange-100 bg-white' : 'border-slate-200'}
                    `}>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-slate-400 font-bold text-sm">Outro:</span>
                        </div>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={selectedAmount ? '' : formatCurrency(rawValue).replace('R$', '').trim()}
                            onKeyDown={handleKeyDown}
                            onChange={() => { }} // Controlled input requires this or readOnly
                            placeholder="0,00"
                            className="block w-full text-right pr-4 pl-16 py-3 bg-transparent text-xl font-bold text-slate-700 placeholder-slate-300 focus:outline-none cursor-text"
                            onFocus={(e) => {
                                // Optional: Move cursor to end on focus if desired, though keydown logic makes it irrelevant
                            }}
                        />
                    </div>
                </div>

                {/* Copy Button */}
                <button
                    onClick={handleCopy}
                    className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-sm text-sm"
                >
                    {copied ? (
                        <>
                            <Check size={16} className="text-emerald-400" />
                            <span className="text-emerald-100">Copiado!</span>
                        </>
                    ) : (
                        <>
                            <Copy size={16} />
                            <span>Copiar Código</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
