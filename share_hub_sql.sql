use share_hub;

CREATE TABLE User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    is_Admin BOOL DEFAULT FALSE
);
CREATE TABLE UserDetail (
    user_id INT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    DOB DATE NOT NULL,
    bio TEXT,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
);
CREATE TABLE Friend (
    frd_id INT AUTO_INCREMENT PRIMARY KEY,
    frd_from INT NOT NULL,
    frd_to INT NOT NULL,
    FOREIGN KEY (frd_from) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (frd_to) REFERENCES User(user_id) ON DELETE CASCADE
);
CREATE TABLE Post (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    post_link VARCHAR(500),
    post_desc TEXT,
    posted_by INT NOT NULL,
    FOREIGN KEY (posted_by) REFERENCES User(user_id) ON DELETE CASCADE
);
CREATE TABLE Likes(
    like_id INT AUTO_INCREMENT PRIMARY KEY,
    liked_by INT NOT NULL,
    liked_to_post INT NOT NULL,
    FOREIGN KEY (liked_by) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (liked_to_post) REFERENCES Post(post_id) ON DELETE CASCADE
);
CREATE TABLE Comment (
    cmt_id INT AUTO_INCREMENT PRIMARY KEY,
    cmt_txt TEXT NOT NULL,
    cmt_by INT NOT NULL,
    cmt_to_post INT NOT NULL,
    FOREIGN KEY (cmt_by) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (cmt_to_post) REFERENCES Post(post_id) ON DELETE CASCADE
);


DELIMITER $$
CREATE PROCEDURE register_user(
    IN input_first_name VARCHAR(255),
    IN input_last_name VARCHAR(255),
    IN input_email VARCHAR(255), 
    IN input_username VARCHAR(255), 
    IN input_password VARCHAR(255),
    IN input_dob DATE
)
BEGIN
    DECLARE hashed_password VARCHAR(255);
    DECLARE new_user_id INT;
    
    SET hashed_password = SHA2(input_password, 256); 
    INSERT INTO myapp_user (username, email, password) 
    VALUES (input_username, input_email, hashed_password);

    SET new_user_id = LAST_INSERT_ID();
    INSERT INTO myapp_userdetail (user_id, first_name, last_name, dob) 
    VALUES (new_user_id, input_first_name, input_last_name, input_dob);
END$$
DELIMITER ;


DELIMITER $$
CREATE FUNCTION login_user(
    input_email VARCHAR(255), 
    input_password VARCHAR(255)
) RETURNS JSON
DETERMINISTIC
BEGIN
    DECLARE user_data JSON;
    
    SELECT JSON_OBJECT(
        'user_id', u.user_id,
        'username', u.username,
        'email', u.email,
        'first_name', ud.first_name,
        'last_name', ud.last_name,
        'address', ud.address,
        'dob', ud.DOB,
        'bio', ud.bio,
        'is_Admin',u.is_Admin
    ) INTO user_data
    FROM myapp_user u
    LEFT JOIN myapp_userdetail ud ON u.user_id = ud.user_id
    WHERE u.email = input_email 
      AND u.password = SHA2(input_password, 256);
    
    RETURN user_data;
END$$
DELIMITER ;


DELIMITER //
CREATE TRIGGER validate_password_before_update
BEFORE UPDATE ON myapp_userdetail
FOR EACH ROW
BEGIN
    DECLARE stored_password VARCHAR(100);
    SELECT password INTO stored_password 
    FROM User 
    WHERE user_id = NEW.user_id;

    IF stored_password != @input_password THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Password is incorrect';
    END IF;
END //
DELIMITER ;


DELIMITER //
CREATE PROCEDURE insert_post(
    IN p_post_link TEXT,
    IN p_post_desc TEXT,
    IN p_user_id INT
)
BEGIN
    INSERT INTO myapp_post (post_link, post_desc, posted_by_id)
    VALUES (p_post_link, p_post_desc, p_user_id);
END //
DELIMITER ;


SHOW PROCEDURE STATUS WHERE Db = 'share_hub';
DROP PROCEDURE IF EXISTS insert_post;
SHOW FUNCTION STATUS WHERE Db = 'share_hub';
DROP FUNCTION IF EXISTS login_user;
DROP TRIGGER IF EXISTS validate_password_before_update;

