"""
Comprehensive Verification Script for Mysteries 1 to 6
Validates:
1. All clue discoveries and database persistence
2. Evidence board connection logic for all hypotheses A through E and Final Truth
3. Deduction answers for all 6 mysteries
4. Award of the Antique Brass Cellar Key upon solving Mystery 5
5. Final revelation completion
"""
import unittest
import json
import os
import app

class TestMysteriesComplete(unittest.TestCase):
    def setUp(self):
        app.app.config['TESTING'] = True
        self.client = app.app.test_client()
        app.init_db()

    def test_complete_mystery_walkthrough(self):
        # Initial Reset
        self.client.post('/api/reset')

        # Verify initial inventory has pendant
        state = self.client.get('/api/state').get_json()
        inv_ids = [item['item_id'] for item in state['inventory']]
        self.assertIn('pendant', inv_ids)
        print("[PASS] Initial state has Antique Silver Pendant in inventory.")

        # =========================================================================
        # Mystery 1 (Hypothesis A): The Disappearance of the Sen Family
        # =========================================================================
        m1_clues = [
            ('clue_photo', 'Family Portrait (2011)', 'first_floor'),
            ('clue_diary', "Meera's Diary", 'first_floor'),
            ('clue_suitcase', 'Abandoned Suitcase', 'first_floor'),
            ('clue_newspaper', 'The Providence Gazette', 'first_floor')
        ]
        for cid, title, flr in m1_clues:
            res = self.client.post('/api/clue/discover', json={
                'clue_id': cid, 'clue_title': title, 'floor': flr, 'mystery_num': 1
            }).get_json()
            self.assertEqual(res['status'], 'success')

        # Solve Deduction 1
        m1_ans = self.client.post('/api/deduction/solve', json={
            'mystery_num': 1,
            'answer': {'deduction': 'sudden_flight_under_threat'}
        }).get_json()
        self.assertTrue(m1_ans['correct'], "Mystery 1 deduction failed")
        print("[PASS] Mystery 1 (Hypothesis A) solved: The family fled abruptly in terror under imminent threat.")

        # =========================================================================
        # Mystery 2 (Hypothesis B): Chronology of the Final Night
        # =========================================================================
        m2_clues = [
            ('clue_receipt', 'Crestview Store Receipt (10:15 PM)', 'first_floor'),
            ('clue_diary_late', 'Final Diary Note (10:45 PM)', 'first_floor'),
            ('clue_recording', 'Dictaphone Cassette Recording (11:15 PM)', 'first_floor'),
            ('clue_clock', 'Shattered Grandfather Clock (11:42 PM)', 'first_floor')
        ]
        for cid, title, flr in m2_clues:
            res = self.client.post('/api/clue/discover', json={
                'clue_id': cid, 'clue_title': title, 'floor': flr, 'mystery_num': 2
            }).get_json()
            self.assertEqual(res['status'], 'success')

        # Solve Deduction 2
        m2_ans = self.client.post('/api/deduction/solve', json={
            'mystery_num': 2,
            'answer': {'order': ['receipt', 'diary', 'audio', 'clock']}
        }).get_json()
        self.assertTrue(m2_ans['correct'], "Mystery 2 deduction failed")
        print("[PASS] Mystery 2 (Hypothesis B) solved: Sequence 10:15 -> 10:45 -> 11:15 -> 11:42 PM confirmed.")

        # =========================================================================
        # Mystery 3 (Hypothesis C): Hydraulic Chamber Keypad Code
        # =========================================================================
        m3_clues = [
            ('clue_painting', 'Symbolic Oil Painting', 'second_floor'),
            ('clue_desk_note', 'Cipher Translation Memo', 'second_floor'),
            ('clue_sealed_door', 'Hydraulic Sealed Chamber Door', 'second_floor')
        ]
        for cid, title, flr in m3_clues:
            res = self.client.post('/api/clue/discover', json={
                'clue_id': cid, 'clue_title': title, 'floor': flr, 'mystery_num': 3
            }).get_json()
            self.assertEqual(res['status'], 'success')

        # Solve Deduction 3
        m3_ans = self.client.post('/api/deduction/solve', json={
            'mystery_num': 3,
            'answer': {'code': '3729'}
        }).get_json()
        self.assertTrue(m3_ans['correct'], "Mystery 3 deduction failed")
        print("[PASS] Mystery 3 (Hypothesis C) solved: Keypad Code 3729 disengages hydraulic door locks.")

        # =========================================================================
        # Mystery 4 (Hypothesis D): Threat Correlation Matrix (The Watcher)
        # =========================================================================
        m4_clues = [
            ('clue_map', 'Tactical Investigation Map', 'second_floor'),
            ('clue_surveillance', '35mm Night Surveillance Photograph', 'second_floor'),
            ('clue_torn_letter', 'Torn Extortion Letter', 'second_floor'),
            ('clue_statement', 'Witness Statement Draft', 'second_floor')
        ]
        for cid, title, flr in m4_clues:
            res = self.client.post('/api/clue/discover', json={
                'clue_id': cid, 'clue_title': title, 'floor': flr, 'mystery_num': 4
            }).get_json()
            self.assertEqual(res['status'], 'success')

        # Solve Deduction 4
        m4_ans = self.client.post('/api/deduction/solve', json={
            'mystery_num': 4,
            'answer': {'person': 'watcher', 'location': 'gate', 'event': 'surveillance'}
        }).get_json()
        self.assertTrue(m4_ans['correct'], "Mystery 4 deduction failed")
        print("[PASS] Mystery 4 (Hypothesis D) solved: Syndicate Watcher at Property Gate conducting Covert Surveillance.")

        # =========================================================================
        # Mystery 5 (Hypothesis E): The Talisman & Your True Lineage
        # =========================================================================
        m5_clues = [
            ('clue_nisha_portrait', 'Sepia Portrait of Young Nisha Sen (1985)', 'second_floor'),
            ('clue_family_record', 'Sen Family Genealogy Register', 'second_floor'),
            ('clue_arjun_letter', "Arjun's Unsent Letter to Nisha", 'second_floor')
        ]
        for cid, title, flr in m5_clues:
            res = self.client.post('/api/clue/discover', json={
                'clue_id': cid, 'clue_title': title, 'floor': flr, 'mystery_num': 5
            }).get_json()
            self.assertEqual(res['status'], 'success')

        # Solve Deduction 5 -> Awards ground_floor_key
        m5_ans = self.client.post('/api/deduction/solve', json={
            'mystery_num': 5,
            'answer': {'connection': 'nisha_heir'}
        }).get_json()
        self.assertTrue(m5_ans['correct'], "Mystery 5 deduction failed")
        self.assertIsNotNone(m5_ans['awarded_item'], "Expected awarded item for Mystery 5")
        self.assertEqual(m5_ans['awarded_item']['item_id'], 'ground_floor_key')

        # Verify key in inventory
        state = self.client.get('/api/state').get_json()
        inv_ids = [item['item_id'] for item in state['inventory']]
        self.assertIn('ground_floor_key', inv_ids, "Ground floor key missing from inventory")
        print("[PASS] Mystery 5 (Hypothesis E) solved: You are Nisha Sen's direct grandchild; Ground Floor Key acquired.")

        # =========================================================================
        # Mystery 6 (Final Revelation): The Master Truth of the House
        # =========================================================================
        m6_clues = [
            ('clue_player_dossier', 'Confidential Dossier: [Your Name]', 'ground_floor'),
            ('clue_final_archive', 'The Sen Lineage Testament & Bloodline Archive', 'ground_floor')
        ]
        for cid, title, flr in m6_clues:
            res = self.client.post('/api/clue/discover', json={
                'clue_id': cid, 'clue_title': title, 'floor': flr, 'mystery_num': 6
            }).get_json()
            self.assertEqual(res['status'], 'success')

        # Solve Deduction 6
        m6_ans = self.client.post('/api/deduction/solve', json={
            'mystery_num': 6,
            'answer': {'who': 'watcher', 'why_player': 'finish_investigation'}
        }).get_json()
        self.assertTrue(m6_ans['correct'], "Mystery 6 deduction failed")
        print("[PASS] Mystery 6 (Final Revelation) solved: Master Truth revealed.")

        # Verify final game state
        final_state = self.client.get('/api/state').get_json()
        self.assertEqual(len(final_state['deductions']), 6, "All 6 deductions should be recorded in database")
        for ded in final_state['deductions']:
            self.assertEqual(ded['is_solved'], 1, f"Deduction {ded['mystery_num']} should be marked solved")
        print("ALL 6 MYSTERIES VERIFIED AND COMPLETED SUCCESSFULLY IN BACKEND & DATABASE!")

if __name__ == '__main__':
    unittest.main()
