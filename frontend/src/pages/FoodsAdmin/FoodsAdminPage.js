import React, { useEffect, useState } from 'react';
import classes from './foodsAdminPage.module.css';
import { Link, useParams } from 'react-router-dom';
import { deleteById, getAll, search } from '../../services/foodService';
import NotFound from '../../components/NotFound/NotFound';
import Title from '../../components/Title/Title';
import Search from '../../components/Search/Search';
import { toast } from 'react-toastify';

export default function FoodsAdminPage() {
  const [foods, setFoods] = useState();
  const { searchTerm } = useParams();

  useEffect(() => {
    const loadFoods = async () => {
      const foods = searchTerm ? await search(searchTerm) : await getAll();
      setFoods(foods);
    };
    loadFoods();
  }, [searchTerm]);

  const FoodsNotFound = () => {
    if (foods && foods.length > 0) return;

    return searchTerm ? (
      <NotFound linkRoute="/admin/foods" linkText="Show All" />
    ) : (
      <NotFound linkRoute="/dashboard" linkText="Back to dashboard!" />
    );
  };

  const deleteFood = async food => {
    const confirmed = window.confirm(`Delete Food ${food.name}?`);
    if (!confirmed) return;

    await deleteById(food._id);
    toast.success(`"${food.name}" Has Been Removed!`);
    setFoods(foods.filter(f => f._id !== food._id));
  };

  return (
    <div className={classes.container}>
      <div className={classes.list}>
        <Title title="Manage Foods" margin="1rem auto" />
        <Search
          searchRoute="/admin/foods/"
          defaultRoute="/admin/foods"
          margin="1rem 0"
          placeholder="Search Foods"
        />
        <Link to="/admin/addFood" className={classes.add_food}>
          Add Food +
        </Link>
        <FoodsNotFound />
        {foods &&
          foods.map(food => (
            <div key={food._id} className={classes.list_item}>
              <img src={food.images?.[0]} alt={food.name} />
              <Link to={'/food/' + food._id}>{food.name}</Link>
              <div>
                {food.quantities.map(q => (
                  <span key={q.size}>{q.size}: ₹{q.price} </span>
                ))}
              </div>
              <div className={classes.actions}>
                <Link to={'/admin/editFood/' + food._id}>Edit</Link>
                <Link onClick={() => deleteFood(food)}>Delete</Link>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
