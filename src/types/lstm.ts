export type GateType = 
  | 'forget_gate' 
  | 'input_gate' 
  | 'candidate_gate' 
  | 'cell_state' 
  | 'output_gate' 
  | 'hidden_state'
  | 'input_vector';

export interface StepCalculation {
  stepIndex: number;
  token: string;
  // Raw inputs
  xt: number; // current scalar/projected input value
  ht_prev: number; // previous hidden state
  Ct_prev: number; // previous cell state
  
  // Linear combinations (W * [h, x] + b)
  zf: number;
  zi: number;
  zc: number;
  zo: number;

  // Gate outputs
  ft: number; // Forget gate: sigma(zf) [0, 1]
  it: number; // Input gate: sigma(zi) [0, 1]
  cTilde_t: number; // Candidate: tanh(zc) [-1, 1]
  
  // Memory components
  retainedMemory: number; // ft * Ct_prev
  newMemory: number; // it * cTilde_t
  Ct: number; // Cell state: retainedMemory + newMemory
  
  // Output gate & hidden state
  ot: number; // Output gate: sigma(zo) [0, 1]
  tanhCt: number; // tanh(Ct)
  ht: number; // Hidden state: ot * tanhCt
  
  // Descriptive context
  annotation: string;
  predictedNext?: string;
}

export interface PresetSequence {
  id: string;
  title: string;
  description: string;
  tokens: string[];
  defaultWeights: LstmWeights;
  educationalFocus: string;
}

export interface LstmWeights {
  // Forget gate
  Wf_h: number;
  Wf_x: number;
  bf: number;
  
  // Input gate
  Wi_h: number;
  Wi_x: number;
  bi: number;
  
  // Candidate cell state
  Wc_h: number;
  Wc_x: number;
  bc: number;
  
  // Output gate
  Wo_h: number;
  Wo_x: number;
  bo: number;
}

export interface OverrideValues {
  enabled: boolean;
  ft?: number;
  it?: number;
  cTilde_t?: number;
  ot?: number;
}
