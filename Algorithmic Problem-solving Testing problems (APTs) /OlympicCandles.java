/*Each night that you light a candle, its height will decrease by 1 inch; 
once its height reaches 0 inches, you cannot use it anymore.
Given a int[] candles, the i-th element of which is the height of the 
i-th candle that you own,return the maximum number of nights you can 
celebrate the event without going to the store to get more candles. */

import java.util.*;
public class OlympicCandles {
    public int numberOfNights(int[] candles){
        ArrayList<Integer> candlesList = new ArrayList<>();
		for (int length : candles) {
			candlesList.add(length);
		}
		Collections.sort(candlesList, Collections.reverseOrder());
		int night = 1;
		while (true) {
			for (int i = 0; i < night; i++) {
				candlesList.set(i, candlesList.get(i) - 1);
			}
			Collections.sort(candlesList, Collections.reverseOrder());
			if ((night == candlesList.size()) || (candlesList.get(night) == 0)) {
				return night;
			}
			night ++;
		}
   }
}
