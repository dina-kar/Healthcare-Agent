import sqlite3
import random
from faker import Faker
import pandas as pd

fake = Faker()

def create_synthetic_dataset():
    # Database connection
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            first_name TEXT,
            last_name TEXT,
            city TEXT,
            dietary_preference TEXT,
            medical_conditions TEXT,
            physical_limitations TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Define data distributions
    cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad']
    dietary_prefs = ['vegetarian', 'non-vegetarian', 'vegan']
    medical_conditions = [
        'Type 2 Diabetes', 'Hypertension', 'High Cholesterol', 
        'Heart Disease', 'Obesity', 'Anxiety', 'Depression'
    ]
    physical_limitations = [
        'None', 'Mobility Issues', 'Swallowing Difficulties', 
        'Visual Impairment', 'Hearing Impairment'
    ]
    
    # Generate 100 synthetic users
    users_data = []
    for i in range(100):
        user = {
            'first_name': fake.first_name(),
            'last_name': fake.last_name(),
            'city': random.choice(cities),
            'dietary_preference': random.choice(dietary_prefs),
            'medical_conditions': ', '.join(random.sample(medical_conditions, 
                                          random.randint(0, 3))),
            'physical_limitations': random.choice(physical_limitations)
        }
        users_data.append(user)
    
    # Insert data
    cursor.executemany('''
        INSERT INTO users (first_name, last_name, city, dietary_preference, 
                          medical_conditions, physical_limitations)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', [(u['first_name'], u['last_name'], u['city'], u['dietary_preference'],
           u['medical_conditions'], u['physical_limitations']) for u in users_data])
    
    # Create session tracking tables
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_sessions (
            id INTEGER PRIMARY KEY,
            user_id INTEGER,
            mood TEXT,
            cgm_reading REAL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS food_logs (
            id INTEGER PRIMARY KEY,
            user_id INTEGER,
            meal_description TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()
    
    return users_data

if __name__ == "__main__":
    create_synthetic_dataset()
    print("Synthetic dataset with 100 users created successfully!")
