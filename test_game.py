import unittest
import json
import os
import app

class TestHouseThatRemembered(unittest.TestCase):
    def setUp(self):
        app.app.config['TESTING'] = True
        self.client = app.app.test_client()
        app.init_db()

    def test_01_index_page(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        html = response.get_data(as_text=True)
        self.assertIn('THE HOUSE THAT REMEMBERED', html)
        self.assertIn('canvas-container', html)
        self.assertIn('crosshair', html)
        self.assertIn('notebook-modal', html)
        self.assertIn('three.min.js', html)

    def test_02_static_files_offline(self):
        static_files = [
            '/static/vendor/three.min.js',
            '/static/vendor/PointerLockControls.js',
            '/static/vendor/tailwind.min.css',
            '/static/css/style.css',
            '/static/js/story_config.js',
            '/static/js/audio.js',
            '/static/js/textures.js',
            '/static/js/player_controller.js',
            '/static/js/game_state.js',
            '/static/js/notebook_ui.js',
            '/static/js/house_builder.js',
            '/static/js/main.js'
        ]
        for path in static_files:
            resp = self.client.get(path)
            self.assertEqual(resp.status_code, 200, f"Failed to serve {path}")
            self.assertGreater(len(resp.data), 0, f"Empty file: {path}")

    def test_03_default_state(self):
        resp = self.client.get('/api/state')
        self.assertEqual(resp.status_code, 200)
        data = resp.get_json()
        self.assertEqual(data['status'], 'success')
        # Check default inventory has pendant
        items = [i['item_id'] for i in data['inventory']]
        self.assertIn('pendant', items)

    def test_04_save_and_load(self):
        save_payload = {
            'slot_name': 'test_slot',
            'position': {'x': 2.5, 'y': 1.7, 'z': -4.0},
            'rotation': {'yaw': 1.57, 'pitch': 0.1},
            'current_floor': 'first_floor',
            'current_objective': 'Search the living room',
            'active_mystery': 1
        }
        resp = self.client.post('/api/save', json=save_payload)
        self.assertEqual(resp.status_code, 200)

        load_resp = self.client.post('/api/load', json={'slot_name': 'test_slot'})
        self.assertEqual(load_resp.status_code, 200)
        loaded = load_resp.get_json()['save']
        self.assertAlmostEqual(loaded['player_x'], 2.5)
        self.assertEqual(loaded['current_floor'], 'first_floor')

    def test_05_clue_discovery(self):
        resp = self.client.post('/api/clue/discover', json={
            'clue_id': 'clue_photo',
            'clue_title': 'Family Photograph (2011)',
            'floor': 'first_floor',
            'mystery_num': 1
        })
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.get_json()['clue_id'], 'clue_photo')

    def test_06_mystery_deductions_progression(self):
        # Mystery 1 Wrong then Correct
        m1_wrong = self.client.post('/api/deduction/solve', json={
            'mystery_num': 1,
            'answer': {'deduction': 'vacation'}
        }).get_json()
        self.assertFalse(m1_wrong['correct'])

        m1_correct = self.client.post('/api/deduction/solve', json={
            'mystery_num': 1,
            'answer': {'deduction': 'sudden_flight_under_threat'}
        }).get_json()
        self.assertTrue(m1_correct['correct'])

        # Mystery 2: Timeline order
        m2_correct = self.client.post('/api/deduction/solve', json={
            'mystery_num': 2,
            'answer': {'order': ['receipt', 'diary', 'audio', 'clock']}
        }).get_json()
        self.assertTrue(m2_correct['correct'])

        # Mystery 3: Sealed room code
        m3_correct = self.client.post('/api/deduction/solve', json={
            'mystery_num': 3,
            'answer': {'code': '3729'}
        }).get_json()
        self.assertTrue(m3_correct['correct'])

        # Mystery 4: Last night matrix
        m4_correct = self.client.post('/api/deduction/solve', json={
            'mystery_num': 4,
            'answer': {'person': 'watcher', 'location': 'gate', 'event': 'surveillance'}
        }).get_json()
        self.assertTrue(m4_correct['correct'])

        # Mystery 5: Pendant lineage -> Awards key
        m5_correct = self.client.post('/api/deduction/solve', json={
            'mystery_num': 5,
            'answer': {'connection': 'nisha_heir'}
        }).get_json()
        self.assertTrue(m5_correct['correct'])
        self.assertIsNotNone(m5_correct['awarded_item'])
        self.assertEqual(m5_correct['awarded_item']['item_id'], 'ground_floor_key')

        # Verify key in inventory
        state = self.client.get('/api/state').get_json()
        inv_ids = [i['item_id'] for i in state['inventory']]
        self.assertIn('ground_floor_key', inv_ids)

        # Mystery 6: Final deduction
        m6_correct = self.client.post('/api/deduction/solve', json={
            'mystery_num': 6,
            'answer': {'who': 'watcher', 'why_player': 'finish_investigation'}
        }).get_json()
        self.assertTrue(m6_correct['correct'])

if __name__ == '__main__':
    unittest.main()
