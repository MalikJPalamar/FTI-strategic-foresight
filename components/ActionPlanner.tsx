
import React from 'react';
import { StrategicPlan, StrategicImperative, KeyInitiative } from '../types';
import { TargetIcon, ChecklistIcon, RadarIcon } from './icons';

const KeyInitiativeCard: React.FC<{ initiative: KeyInitiative }> = ({ initiative }) => (
    <div className="bg-black/30 border border-white/5 rounded-xl p-5 hover:bg-black/50 transition-colors">
        <h5 className="font-bold text-cyan-300 text-sm uppercase tracking-wide mb-2">{initiative.initiative}</h5>
        <p className="text-sm text-gray-400 mb-4 leading-relaxed">{initiative.description}</p>
        <div className="border-t border-gray-800 pt-3">
            <h6 className="text-[10px] font-mono font-bold uppercase text-gray-600 mb-2">Tactical First Steps</h6>
            <ul className="space-y-2">
                {initiative.first_steps?.map((step, index) => (
                    <li key={index} className="text-xs text-gray-300 flex items-start gap-2">
                         <span className="text-cyan-500/50 mt-0.5">›</span> {step}
                    </li>
                ))}
            </ul>
        </div>
    </div>
);


const StrategicImperativeCard: React.FC<{ imperative: StrategicImperative }> = ({ imperative }) => (
    <div className="bg-gradient-to-r from-gray-900/80 to-gray-900/40 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-lg">
        <div className="flex items-start gap-4 mb-6">
            <div className="bg-cyan-900/30 p-3 rounded-xl text-cyan-400 border border-cyan-500/20">
                 <TargetIcon className="w-6 h-6" />
            </div>
            <div>
                <h4 className="text-xl font-display font-bold text-white">{imperative.imperative}</h4>
                <p className="text-gray-400 mt-1">{imperative.description}</p>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-0 md:pl-16">
            {imperative.key_initiatives?.map((initiative, index) => (
                <KeyInitiativeCard key={index} initiative={initiative} />
            ))}
        </div>
    </div>
);

export const ActionPlanner: React.FC<{ plan: StrategicPlan }> = ({ plan }) => {
    return (
        <section className="space-y-16 animate-fade-in pb-20">
            <div>
                 <div className="flex items-center gap-2 text-emerald-400 mb-2">
                     <ChecklistIcon className="w-5 h-5" />
                     <span className="font-mono text-xs font-bold uppercase tracking-widest">Step 7: Converge (Action)</span>
                 </div>
                <h2 className="text-4xl font-display font-bold text-white mb-8 border-b border-white/10 pb-6">
                    Strategic Action Plan
                </h2>
                <div className="bg-emerald-900/10 border border-emerald-500/30 rounded-3xl p-10 text-center shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                     <h3 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">
                        {plan.title || "Action Plan"}
                     </h3>
                </div>
            </div>

            <section className="space-y-8">
                {plan.strategic_imperatives && plan.strategic_imperatives.length > 0 ? (
                    plan.strategic_imperatives.map((imperative, index) => (
                        <StrategicImperativeCard key={index} imperative={imperative} />
                    ))
                ) : (
                    <div className="text-gray-500 text-center italic border border-white/5 p-6 rounded-xl">
                        No strategic imperatives defined.
                    </div>
                )}
            </section>
            
            <section>
                 <h3 className="text-lg font-mono font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                    <RadarIcon className="w-5 h-5" />
                    Early Warning Indicators
                </h3>
                <div className="bg-gray-900/40 border border-white/10 rounded-2xl p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plan.early_warning_indicators && plan.early_warning_indicators.length > 0 ? (
                            plan.early_warning_indicators.map((indicator, index) => (
                                <div key={index} className="flex items-start gap-4 p-4 bg-black/30 rounded-xl border border-white/5 hover:border-red-500/30 transition-colors">
                                <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                                <p className="text-sm text-gray-300 leading-snug">{indicator}</p>
                                </div>
                            ))
                        ) : (
                             <div className="text-gray-500 text-sm col-span-full text-center">No indicators generated.</div>
                        )}
                    </div>
                </div>
            </section>
        </section>
    );
};
