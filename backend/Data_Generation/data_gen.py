import random
from faker import Faker
import psycopg2
from datetime import datetime, timedelta

fake = Faker()
F = 10000
BATCH = 1000

brands = ['Toyota','Honda','Ford','Hyundai','Kia','BMW','Audi','Mercedes','Chevrolet','Nissan']
fuel_types = ['Petrol','Diesel','Hybrid','Electric']
transmissions = ['Manual','Automatic','CVT','Dual-clutch']
colors = ['White','Black','Silver','Blue','Red','Green','Gray']
drivetrains = ['FWD','RWD','AWD']
body_types = ['Sedan','Hatchback','SUV','Coupe','Convertible','Wagon','Van']
interiors = ['Cloth','Leather','Synthetic','Suede']
exteriors = ['Metallic','Matte','Pearl']
audio = ['Basic','Premium','BOSE','Harman Kardon','B&O','Sony']

conn = psycopg2.connect(dbname='yourdb', user='youruser', password='yourpass', host='localhost', port=5432)
cur = conn.cursor()

def rand_date(start_year=2010, end_year=2025):
    start = datetime(start_year, 1, 1)
    end = datetime(end_year, 12, 31)
    return start + timedelta(seconds=random.randint(0, int((end - start).total_seconds())))

insert_sql = """
INSERT INTO cars (
 brand, model, variant, year, price, mileage, fuel_type, transmission, color, doors, seats, engine_cc,
 horsepower, torque, drivetrain, body_type, length_mm, width_mm, height_mm, curb_weight_kg, warranty_years,
 emission_class, co2_g_km, registration_year, last_service_date, service_count, dealer_city, dealer_state,
 vin, is_certified, owner_count, previous_accidents, listed_date, sold_date, insurance_group, interior_material,
 exterior_material, audio_system, navigation, sunroof, bluetooth, airbags, abs, traction_control, has_parking_sensors,
 has_camera, price_usd, score_rating, notes
) VALUES %s
"""

def gen_row(i):
    brand = random.choice(brands)
    model = brand + " " + random.choice(['A','B','C','X','Z','S','Plus','GT'])
    variant = random.choice(['Base','S','SE','Sport','LX','EX','Limited'])
    year = random.randint(2005, 2025)
    price = round(random.uniform(5000, 80000), 2)
    mileage = random.randint(0, 300000)
    fuel_type = random.choice(fuel_types)
    transmission = random.choice(transmissions)
    color = random.choice(colors)
    doors = random.choice([2,3,4,5])
    seats = random.choice([2,4,5,7,8])
    engine_cc = random.choice([1000,1200,1400,1600,2000,2500,3000,3500])
    horsepower = random.randint(60,450)
    torque = random.randint(80,700)
    drivetrain = random.choice(drivetrains)
    body_type = random.choice(body_types)
    length_mm = random.randint(3500,5000)
    width_mm = random.randint(1500,2100)
    height_mm = random.randint(1200,2000)
    curb_weight_kg = random.randint(800,3000)
    warranty_years = random.choice([0,1,2,3,5])
    emission_class = random.choice(['Euro3','Euro4','Euro5','Euro6'])
    co2_g_km = random.randint(50,400)
    registration_year = random.randint(2005,2025)
    last_service_date = rand_date(2018,2025).date()
    service_count = random.randint(0,20)
    dealer_city = fake.city()
    dealer_state = fake.state()
    vin = fake.unique.bothify(text='??######?????????')
    is_certified = random.choice([True, False])
    owner_count = random.randint(0,5)
    previous_accidents = random.randint(0,3)
    listed_date = rand_date(2015,2025).date()
    sold_date = (listed_date + timedelta(days=random.randint(0,1000))) if random.random()<0.2 else None
    insurance_group = random.randint(1,50)
    interior_material = random.choice(interiors)
    exterior_material = random.choice(exteriors)
    audio_system = random.choice(audio)
    navigation = random.choice([True, False])
    sunroof = random.choice([True, False])
    bluetooth = random.choice([True, False])
    airbags = random.choice([2,4,6,8])
    abs = random.choice([True, False])
    traction_control = random.choice([True, False])
    has_parking_sensors = random.choice([True, False])
    has_camera = random.choice([True, False])
    price_usd = round(price * random.uniform(0.9,1.2), 2)
    score_rating = round(random.uniform(1.0,5.0), 2)
    notes = fake.sentence(nb_words=8)
    vals = (
        brand, model, variant, year, price, mileage, fuel_type, transmission, color, doors, seats, engine_cc,
        horsepower, torque, drivetrain, body_type, length_mm, width_mm, height_mm, curb_weight_kg, warranty_years,
        emission_class, co2_g_km, registration_year, last_service_date, service_count, dealer_city, dealer_state,
        vin, is_certified, owner_count, previous_accidents, listed_date, sold_date, insurance_group, interior_material,
        exterior_material, audio_system, navigation, sunroof, bluetooth, airbags, abs, traction_control, has_parking_sensors,
        has_camera, price_usd, score_rating, notes
    )
    return vals

from psycopg2.extras import execute_values
rows = []
for i in range(1, F+1):
    rows.append(gen_row(i))
    if len(rows) >= BATCH:
        execute_values(cur, insert_sql, rows)
        conn.commit()
        print(f"Inserted {i} rows")
        rows = []
if rows:
    execute_values(cur, insert_sql, rows)
    conn.commit()
    print("Inserted final batch")
cur.close()
conn.close()
print("Done")
