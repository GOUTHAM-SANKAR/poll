-- Insert sample data for testing

-- Insert sample polls
INSERT INTO polls (title, description, end_date, is_active) VALUES
('Best Time for Campus Events', 'Help us decide the optimal timing for future campus events', '2024-02-15', true),
('Preferred Study Environment', 'What type of study spaces would you like to see more of on campus?', '2024-02-20', true),
('Campus Food Options', 'Which new food options would you like to see in the cafeteria?', '2024-02-25', true);

-- Insert poll options for the first poll
INSERT INTO poll_options (poll_id, option_text, option_order) VALUES
(1, 'Morning (9-11 AM)', 1),
(1, 'Afternoon (2-4 PM)', 2),
(1, 'Evening (6-8 PM)', 3);

-- Insert poll options for the second poll
INSERT INTO poll_options (poll_id, option_text, option_order) VALUES
(2, 'Quiet individual spaces', 1),
(2, 'Collaborative group areas', 2),
(2, 'Tech-enabled smart rooms', 3);

-- Insert poll options for the third poll
INSERT INTO poll_options (poll_id, option_text, option_order) VALUES
(3, 'Asian cuisine', 1),
(3, 'Mediterranean food', 2),
(3, 'Vegetarian/Vegan options', 3),
(3, 'Local specialties', 4);

-- Insert sample posts
INSERT INTO posts (title, content, category, author) VALUES
('New Library Hours Announced', 'The campus library will now be open 24/7 during exam periods. This change takes effect starting next week and will continue through the end of the semester.', 'Announcement', 'Library Administration'),
('Student Council Elections', 'Nominations for student council positions are now open. Submit your applications by February 10th. Elections will be held on February 15th.', 'Elections', 'Student Affairs'),
('Campus WiFi Upgrade Complete', 'The campus-wide WiFi upgrade has been completed. Students should now experience faster and more reliable internet connectivity across all buildings.', 'Academic', 'IT Department'),
('Spring Festival Planning', 'We are planning our annual Spring Festival! If you would like to volunteer or have suggestions for activities, please contact the student activities office.', 'Events', 'Student Activities');

-- Insert a sample admin user (password should be hashed in real implementation)
INSERT INTO admin_users (username, password_hash, email, role) VALUES
('admin', '$2b$10$example_hash_here', 'admin@campus.edu', 'admin');

-- Insert some sample users
INSERT INTO users (student_id, email, name) VALUES
('STU001', 'student1@campus.edu', 'John Doe'),
('STU002', 'student2@campus.edu', 'Jane Smith'),
('STU003', 'student3@campus.edu', 'Mike Johnson');
