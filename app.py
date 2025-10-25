from flask import Flask, render_template, request, jsonify
from datetime import datetime, date
import json
import os

app = Flask(__name__)

# Data storage (in production, use a proper database)
patients_db = {}
tests_db = {}
results_db = {}

class BloodTestAnalyzer:
    """Class to handle blood test analysis and result interpretation"""
    
    def __init__(self):
        self.normal_ranges = {
            'cbc': {
                'hemoglobin': {'min': 12.0, 'max': 16.0, 'unit': 'g/dL'},
                'hematocrit': {'min': 36.0, 'max': 46.0, 'unit': '%'},
                'white_blood_cells': {'min': 4.5, 'max': 11.0, 'unit': 'K/uL'},
                'platelets': {'min': 150, 'max': 450, 'unit': 'K/uL'},
                'red_blood_cells': {'min': 4.0, 'max': 5.5, 'unit': 'M/uL'}
            },
            'lipid': {
                'total_cholesterol': {'min': 0, 'max': 200, 'unit': 'mg/dL'},
                'hdl_cholesterol': {'min': 40, 'max': 100, 'unit': 'mg/dL'},
                'ldl_cholesterol': {'min': 0, 'max': 100, 'unit': 'mg/dL'},
                'triglycerides': {'min': 0, 'max': 150, 'unit': 'mg/dL'}
            },
            'glucose': {
                'fasting_glucose': {'min': 70, 'max': 100, 'unit': 'mg/dL'},
                'random_glucose': {'min': 70, 'max': 140, 'unit': 'mg/dL'}
            },
            'liver': {
                'alt': {'min': 7, 'max': 56, 'unit': 'U/L'},
                'ast': {'min': 10, 'max': 40, 'unit': 'U/L'},
                'bilirubin': {'min': 0.3, 'max': 1.2, 'unit': 'mg/dL'},
                'alkaline_phosphatase': {'min': 44, 'max': 147, 'unit': 'U/L'}
            },
            'kidney': {
                'creatinine': {'min': 0.6, 'max': 1.2, 'unit': 'mg/dL'},
                'bun': {'min': 7, 'max': 20, 'unit': 'mg/dL'},
                'egfr': {'min': 90, 'max': 120, 'unit': 'mL/min/1.73m²'}
            },
            'thyroid': {
                'tsh': {'min': 0.4, 'max': 4.0, 'unit': 'mIU/L'},
                't3': {'min': 80, 'max': 200, 'unit': 'ng/dL'},
                't4': {'min': 4.5, 'max': 12.5, 'unit': 'μg/dL'}
            }
        }
    
    def analyze_test(self, test_type, values):
        """Analyze test results and provide interpretation"""
        if test_type not in self.normal_ranges:
            return {"error": "Unknown test type"}
        
        analysis = {}
        ranges = self.normal_ranges[test_type]
        
        for parameter, value in values.items():
            if parameter in ranges:
                range_info = ranges[parameter]
                min_val = range_info['min']
                max_val = range_info['max']
                unit = range_info['unit']
                
                if value < min_val:
                    status = "Low"
                    interpretation = f"Below normal range ({min_val}-{max_val} {unit})"
                elif value > max_val:
                    status = "High"
                    interpretation = f"Above normal range ({min_val}-{max_val} {unit})"
                else:
                    status = "Normal"
                    interpretation = f"Within normal range ({min_val}-{max_val} {unit})"
                
                analysis[parameter] = {
                    'value': value,
                    'unit': unit,
                    'status': status,
                    'interpretation': interpretation,
                    'normal_range': f"{min_val}-{max_val} {unit}"
                }
        
        return analysis

analyzer = BloodTestAnalyzer()

@app.route('/')
def index():
    """Serve the main page"""
    return render_template('index.html')

@app.route('/api/register_patient', methods=['POST'])
def register_patient():
    """Register a new patient"""
    try:
        data = request.get_json()
        
        patient_id = data.get('patientId')
        if not patient_id:
            return jsonify({'error': 'Patient ID is required'}), 400
        
        if patient_id in patients_db:
            return jsonify({'error': 'Patient ID already exists'}), 400
        
        patient_data = {
            'patientId': patient_id,
            'firstName': data.get('firstName'),
            'lastName': data.get('lastName'),
            'dateOfBirth': data.get('dateOfBirth'),
            'gender': data.get('gender'),
            'phone': data.get('phone'),
            'email': data.get('email'),
            'registrationDate': datetime.now().isoformat()
        }
        
        patients_db[patient_id] = patient_data
        
        return jsonify({
            'success': True,
            'message': 'Patient registered successfully',
            'patient': patient_data
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/submit_test', methods=['POST'])
def submit_test():
    """Submit a blood test request"""
    try:
        data = request.get_json()
        
        patient_id = data.get('testPatientId')
        if not patient_id:
            return jsonify({'error': 'Patient ID is required'}), 400
        
        if patient_id not in patients_db:
            return jsonify({'error': 'Patient not found'}), 404
        
        test_id = f"TEST_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{patient_id}"
        
        test_data = {
            'testId': test_id,
            'patientId': patient_id,
            'testType': data.get('testType'),
            'testDate': data.get('testDate'),
            'doctorName': data.get('doctorName'),
            'notes': data.get('notes'),
            'status': 'pending',
            'submissionDate': datetime.now().isoformat()
        }
        
        tests_db[test_id] = test_data
        
        return jsonify({
            'success': True,
            'message': 'Test request submitted successfully',
            'testId': test_id,
            'test': test_data
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/search_results/<patient_id>')
def search_results(patient_id):
    """Search test results by patient ID"""
    try:
        if patient_id not in patients_db:
            return jsonify({'error': 'Patient not found'}), 404
        
        patient_tests = [test for test in tests_db.values() if test['patientId'] == patient_id]
        patient_results = [result for result in results_db.values() if result['patientId'] == patient_id]
        
        return jsonify({
            'success': True,
            'patient': patients_db[patient_id],
            'tests': patient_tests,
            'results': patient_results
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/process_test/<test_id>', methods=['POST'])
def process_test(test_id):
    """Process a test and generate results (simulated)"""
    try:
        if test_id not in tests_db:
            return jsonify({'error': 'Test not found'}), 404
        
        test = tests_db[test_id]
        test_type = test['testType']
        
        # Simulate test results (in real application, this would come from lab equipment)
        simulated_results = generate_simulated_results(test_type)
        
        # Analyze the results
        analysis = analyzer.analyze_test(test_type, simulated_results)
        
        result_data = {
            'resultId': f"RESULT_{test_id}",
            'testId': test_id,
            'patientId': test['patientId'],
            'testType': test_type,
            'results': simulated_results,
            'analysis': analysis,
            'processedDate': datetime.now().isoformat(),
            'status': 'completed'
        }
        
        results_db[result_data['resultId']] = result_data
        
        # Update test status
        tests_db[test_id]['status'] = 'completed'
        
        return jsonify({
            'success': True,
            'message': 'Test processed successfully',
            'result': result_data
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def generate_simulated_results(test_type):
    """Generate simulated test results for demonstration"""
    import random
    
    if test_type == 'cbc':
        return {
            'hemoglobin': round(random.uniform(11.0, 17.0), 1),
            'hematocrit': round(random.uniform(35.0, 47.0), 1),
            'white_blood_cells': round(random.uniform(4.0, 12.0), 1),
            'platelets': round(random.uniform(140, 460), 0),
            'red_blood_cells': round(random.uniform(3.8, 5.7), 2)
        }
    elif test_type == 'lipid':
        return {
            'total_cholesterol': round(random.uniform(150, 250), 0),
            'hdl_cholesterol': round(random.uniform(35, 105), 0),
            'ldl_cholesterol': round(random.uniform(80, 120), 0),
            'triglycerides': round(random.uniform(100, 200), 0)
        }
    elif test_type == 'glucose':
        return {
            'fasting_glucose': round(random.uniform(65, 110), 0),
            'random_glucose': round(random.uniform(70, 150), 0)
        }
    elif test_type == 'liver':
        return {
            'alt': round(random.uniform(5, 60), 0),
            'ast': round(random.uniform(8, 45), 0),
            'bilirubin': round(random.uniform(0.2, 1.5), 1),
            'alkaline_phosphatase': round(random.uniform(40, 150), 0)
        }
    elif test_type == 'kidney':
        return {
            'creatinine': round(random.uniform(0.5, 1.5), 1),
            'bun': round(random.uniform(6, 25), 0),
            'egfr': round(random.uniform(85, 125), 0)
        }
    elif test_type == 'thyroid':
        return {
            'tsh': round(random.uniform(0.3, 5.0), 1),
            't3': round(random.uniform(75, 210), 0),
            't4': round(random.uniform(4.0, 13.0), 1)
        }
    else:
        return {}

@app.route('/api/get_all_patients')
def get_all_patients():
    """Get all registered patients"""
    return jsonify({
        'success': True,
        'patients': list(patients_db.values())
    })

@app.route('/api/get_all_tests')
def get_all_tests():
    """Get all test requests"""
    return jsonify({
        'success': True,
        'tests': list(tests_db.values())
    })

@app.route('/api/get_all_results')
def get_all_results():
    """Get all test results"""
    return jsonify({
        'success': True,
        'results': list(results_db.values())
    })

if __name__ == '__main__':
    # Create templates directory if it doesn't exist
    os.makedirs('templates', exist_ok=True)
    
    # Move HTML file to templates directory
    if os.path.exists('index.html'):
        os.rename('index.html', 'templates/index.html')
    
    print("Blood Testing Laboratory Management System")
    print("Starting Flask server...")
    print("Access the application at: http://localhost:5000")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
