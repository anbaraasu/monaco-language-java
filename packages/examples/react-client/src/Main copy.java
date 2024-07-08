import java.util.List;
import java.util.ArrayList;

public class Main {
      public static void main(String[] args) {
          OrderServiceImpl orderServiceImpl = new OrderServiceImpl();
          orderServiceImpl.checkout(new Product(1,"Phone"));
          orderServiceImpl.showCart().forEach(System.out::println);
      }
  }

/**
* Product Class - id, name
*/
class Product{
    private int id;
    private String name;
    Product(int id, String name){
        this.id = id;
        this.name = name;
    }

    @Override
    public String toString() {
        return "Order[id: " + this.id + ", name:" + this.name + "]";
    }
}
  interface OrderService{
    public void checkout(Product product);
    public List<Product> showCart();
  }

class OrderServiceImpl implements OrderService{
    List<Product> pList = new ArrayList<Product>();
    public void checkout(Product product){
        pList.add(product);
    }
    public List<Product> showCart(){
        return pList;
    }
}