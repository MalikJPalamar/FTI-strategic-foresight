
import React from 'react';
import { StrategicPlan, StrategicImperative, KeyInitiative } from '../types';
import { TargetIcon, ChecklistIcon, RadarIcon } from './icons';

const KeyInitiativeCard: React.FC<{ initiative: KeyInitiative }> = ({ initiative }) => (
    <div className="bg-gray-900/70 border border-gray-700 rounded-lg p-4">
        <h5 className="font-semibold text-cyan-400">{initiative.initiative}</h5>
        <p className="mt-1 text-sm text-gray-400">{initiative.description}</p>
        <div className="mt-3 border-t border-gray-700/50 pt-3">
            <h6 className="text-xs font-bold uppercase tracking-wider text-gray-500">First Steps</h6>
            <ul className="mt-2 space-y-1 text-sm text-gray-300 list-disc list-inside">
                {initiative.first_steps.map((step, index) => (
                    <li key={index}>{step}</li>
                ))}
            </ul>
        </div>
    </div>
);


const StrategicImperativeCard: React.FC<{ imperative: StrategicImperative }> = ({ imperative }) => (
    <div className="bg-gradient-to-br from-gray-900 to-black/50 border border-gray-800 rounded-xl p-6">
        <h4 className="text-xl font-bold text-gray-200 flex items-start gap-3">
            <TargetIcon className="w-6 h-6 text-cyan-400 mt-1 flex-shrink-0" />
            <span>{imperative.imperative}</span>
        </h4>
        <p className="mt-2 text-gray-400 ml-9">{imperative.description}</p>
        <div className="mt-4 space-y-3 ml-9">
            {imperative.key_initiatives.map((initiative, index) => (
                <KeyInitiativeCard key={index} initiative={initiative} />
            ))}
        </div>
    </div>
);

export const ActionPlanner: React.FC<{ plan: StrategicPlan }> = ({ plan }) => {
    return (
        <section className="space-y-12">
            <div>
                <h2 className="text-2xl font-bold text-gray-200 border-b-2 border-cyan-500/30 pb-2 mb-6">
                    Step 7: Strategic Action Plan (Converging)
                </h2>
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 text-center shadow-2xl shadow-black/30">
                     <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400">
                        {plan.title}
                     </h3>
                </div>
            </div>

            <section>
                <h3 className="text-xl font-semibold text-gray-300 mb-4 flex items-center gap-3">
                    <ChecklistIcon className="w-6 h-6" />
                    Strategic Imperatives & Initiatives
                </h3>
                <div className="space-y-6">
                    {plan.strategic_imperatives.map((imperative, index) => (
                        <StrategicImperativeCard key={index} imperative={imperative} />
                    ))}
                </div>
            </section>
            
            <section>
                 <h3 className="text-xl font-semibold text-gray-300 mb-4 flex items-center gap-3">
                    <RadarIcon className="w-6 h-6" />
                    Early Warning Indicators
                </h3>
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plan.early_warning_indicators.map((indicator, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-900 rounded-md">
                           <RadarIcon className="w-4 h-4 text-cyan-500 mt-1 flex-shrink-0" />
                           <p className="text-gray-300">{indicator}</p>
                        </div>
                    ))}
                </div>
            </section>
        </section>
    );
};
